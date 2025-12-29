//I assume that this solution is not the scalable approach but it is better and clean code -> way more suitable for this task tbh.
//1. Row by Row insertion to database (N insertions into database )
//2. Cons: N insertions into database -> Slow + Locks database if transaction.
//3. Pros: Will not cause OOM problem if you are using streaming.
//   Easier to write than the bulk/batch insert logic! -> takes 30 minutes to write ;-;
//   Average speed is 100ms tested (10 rows) and 150ms for (1000 rows) on my laptop
import { Readable } from 'stream';
import { parse } from 'fast-csv';
import sequelize from '../utils/db/connect';
import StoreModel, { Store } from '../models/store.model';
import AuthorModel, { Author } from '../models/author.model';
import BookModel, { Book } from '../models/book.mode';
import StoreBookModel, { StoreBook } from '../models/store-book.model';

interface Inventory {
  store_name: string;
  store_address: string;
  book_name: string;
  pages: number;
  author_name: string;
  price: number;
  logo: string;
  copies: number;
}

export const parseCSVBuffer = async (file: Buffer) => {
  const inventoryMap = new Map<string, Inventory>();
  return new Promise((resolve, reject) => {
    Readable.from(file)
      .pipe(
        parse({
          headers: true,
          trim: true,
          ignoreEmpty: true,
        }),
      )
      .on('error', reject)
      .on('data', (r: Inventory) => {
        //TODO: JOI Validation per ROW!

        const key = `${r.store_name}|${r.store_address}|${r.book_name}|${r.author_name}`;
        const row = inventoryMap.get(key);
        if (row) {
          row.copies += 1;
        } else {
          inventoryMap.set(key, { ...r, copies: 1 });
        }
      })
      .on('end', () => {
        resolve(Array.from(inventoryMap.values()));
      });
  });
};
export const pipeline = async (file: Buffer) => {
  const inventory = (await parseCSVBuffer(file)) as Inventory[];
  await sequelize.transaction(async (t) => {
    for (const item of inventory) {
      const storeDto: Partial<Store> = {
        name: item.store_name,
        address: item.store_address,
        logo: item.logo,
      };
      const authorDto: Partial<Author> = {
        name: item.author_name,
      };

      const [store] = await StoreModel.upsert(storeDto, {
        conflictFields: ['name', 'address'],
        transaction: t,
      });
      const [author] = await AuthorModel.upsert(authorDto, {
        conflictFields: ['name'],
        transaction: t,
      });
      const bookDto: Partial<Book> = {
        name: item.book_name,
        pages: item.pages,
        authorId: (author as Author).id,
      };
      const [book] = await BookModel.upsert(bookDto, {
        conflictFields: ['name'],
        transaction: t,
      });

      const [storeBook, created] = await StoreBookModel.findOrCreate({
        where: {
          storeId: (store as Store).id,
          bookId: (book as Book).id,
        },
        defaults: {
          price: item.price,
          copies: item.copies,
          isSoldOut: false,
        },
        transaction: t,
      });
      if (!created) {
        storeBook.set({
          copies: (storeBook as StoreBook).copies + item.copies,
        });
        await storeBook.save({ transaction: t });
      }
    }
  });
};
