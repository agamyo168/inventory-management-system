//1. Parse the CSV --> create a store array
//TODO: There could be an out of memory problem but I'll ignore it for this MVP.
//2. BulkInsert to Store and make sure it's idempotent when the CSV doesn't change!
//3. Start parsing the book data and handle it in a similar fashion! + Managed Transaction and error message

import { Readable } from "stream";
import { parse } from "fast-csv";
import AuthorModel, { Author } from "../models/author.model";
import sequelize from "../utils/db/connect";
import BookModel, { Book } from "../models/book.mode";
import StoreModel, { Store } from "../models/store.model";
import StoreBookModel, { StoreBook } from "../models/store-book.model";
import { Op } from "sequelize";

//4. Figure out how to increment repeated books -> Sequelize should be able to handle this by default!
interface Inventory {
  store_name: string;
  store_address: string;
  book_name: string;
  pages: number; // Parsed from CSV string
  author_name: string;
  price: number; // Parsed from CSV string
  logo: string; // URL or filename
  copies: number; // Used for incrementing stock
}
export const parseCSVBuffer = async (file: Buffer) => {
  const inventoryMap = new Map<string, any>();
  return new Promise((resolve, reject) => {
    Readable.from(file)
      .pipe(
        parse({
          headers: true,
          trim: true,
          ignoreEmpty: true,
        })
      )
      .on("error", reject)
      .on("data", (r) => {
        //TODO: JOI Validation per ROW!
        const key = `${r.store_name}|${r.store_address}|${r.book_name}|${r.author_name}`;
        if (!inventoryMap.has(key)) {
          inventoryMap.set(key, {
            ...r,
            copies: 1,
          });
        } else {
          inventoryMap.get(key).copies += 1;
        }
      })
      .on("end", () => {
        resolve(Array.from(inventoryMap.values()));
      });
  });
};
// TODO: There's a Sequelize function that could handle this?
export const pipeline = async (file: Buffer) => {
  const inventory = (await parseCSVBuffer(file)) as Inventory[];
  const authorSet = new Set<string>();
  const storeSet = new Set<string>();

  await sequelize.transaction(async (t) => {
    const authors: { name: string }[] = [];
    const stores: Partial<Store>[] = [];

    inventory.forEach((r) => {
      const storeKey = `${r.store_name}${r.store_address}`;
      if (!authorSet.has(r.author_name)) {
        authorSet.add(r.author_name);
        authors.push({ name: r.author_name });
      }
      if (!storeSet.has(storeKey)) {
        storeSet.add(storeKey);
        stores.push({
          name: r.store_name,
          address: r.store_address,
          logo: r.logo,
        });
      }
    });
    const [savedAuthors, savedStores] = await Promise.all([
      AuthorModel.bulkCreate(authors, {
        ignoreDuplicates: true,
        transaction: t,
        returning: true,
      }) as unknown as Author[],
      StoreModel.bulkCreate(stores, {
        updateOnDuplicate: ["logo"],
        transaction: t,
        returning: true,
      }) as unknown as Store[],
    ]);
    const storeIdMap = new Map(
      savedStores.map((s) => [`${s.name}|${s.address}`, s.id])
    );
    const authorIdMap = new Map(savedAuthors.map((a) => [a.name, a.id]));
    const booksMap = new Map<string, Partial<Book>>();
    inventory.forEach((r) => {
      const authorId = authorIdMap.get(r.author_name);
      const key = `${r.book_name}|${authorId}`;
      if (!booksMap.has(key)) {
        booksMap.set(key, {
          name: r.book_name,
          pages: r.pages,
          authorId,
        });
      }
    });
    const savedBooks = (await BookModel.bulkCreate([...booksMap.values()], {
      updateOnDuplicate: ["pages"],
      transaction: t,
      returning: true,
    })) as unknown as Book[];
    const bookIdMap = new Map(
      savedBooks.map((b) => [`${b.name}|${b.authorId}`, b.id])
    );
    const storeBooksMap = new Map<string, any>();
    const storeIds: number[] = [];
    const bookIds: number[] = [];
    inventory.forEach((r) => {
      const storeId = storeIdMap.get(`${r.store_name}|${r.store_address}`);
      const bookId = bookIdMap.get(
        `${r.book_name}|${authorIdMap.get(r.author_name)}`
      );

      const key = `${storeId}|${bookId}`;

      if (!storeBooksMap.has(key)) {
        storeIds.push(storeId as number);
        bookIds.push(bookId as number);

        storeBooksMap.set(key, {
          storeId,
          bookId,
          price: r.price,
          copies: r.copies,
        });
      } else {
        storeBooksMap.get(key).copies += r.copies;
      }
    });
    //These are the already stored books in database
    const savedStoreBooks = (await StoreBookModel.findAll({
      where: { storeId: { [Op.in]: storeIds }, bookId: { [Op.in]: bookIds } },
    })) as unknown as StoreBook[];
    savedStoreBooks.forEach((storeBook) => {
      const key = `${storeBook.storeId}|${storeBook.bookId}`;
      storeBooksMap.get(key).copies += Number(storeBook.copies) || 0;
    });
    await StoreBookModel.bulkCreate([...storeBooksMap.values()], {
      updateOnDuplicate: ["copies", "price", "isSoldOut"],
      transaction: t,
    });
  });
};
