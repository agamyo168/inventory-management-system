import BookModel from "../models/book.mode";
import StoreBookModel from "../models/store-book.model";
import AuthorModel from "../models/author.model";
import sequelize from "sequelize";
import StoreModel, { Store } from "../models/store.model";
import PDFDocument from "pdfkit";
import logger from "../utils/logger";
import NotFound from "../middlewares/error/custom/notfound.error.class";
import axios from "axios";

export const topFivePricedBooks = async (storeId: number) => {
  return StoreBookModel.findAll({
    attributes: [[sequelize.col("name"), "bookName"], "price"],
    where: {
      storeId,
    },
    order: [["price", "DESC"]],
    limit: 5,
    include: [
      {
        attributes: [],
        model: BookModel,
        required: true,
      },
    ],
    raw: true,
  });
};

export const topFiveProlificAuthors = async (storeId: number) => {
  return StoreBookModel.findAll({
    attributes: [
      [sequelize.col("Book.Author.name"), "authorName"],
      [sequelize.fn("COUNT", sequelize.col("Book.id")), "bookCount"],
    ],
    include: [
      {
        attributes: [],
        model: BookModel,
        required: true,
        include: [{ model: AuthorModel, required: true, attributes: [] }],
      },
    ],
    where: { storeId },

    group: [sequelize.col("Book.Author.id")],
    order: [[sequelize.fn("COUNT", sequelize.col("Book.id")), "DESC"]],
    limit: 5,
    subQuery: false,
    raw: true,
  });
};
export const fetchImage = async (url: string) => {
  const response = await axios.get(url, { responseType: "arraybuffer" });
  return Buffer.from(response.data);
};

export const pdfReport = async (storeId: number) => {
  const [store, books, authors] = await Promise.all([
    StoreModel.findOne({ where: { id: storeId } }) as unknown as Store,
    topFivePricedBooks(storeId) as unknown as {
      bookName: string;
      price: number;
    }[],
    topFiveProlificAuthors(storeId) as unknown as {
      authorName: string;
      bookCount: number;
    }[],
  ]);
  logger.info(`${store}: ${storeId}`);

  if (!store) throw new NotFound("STORE_NOT_FOUND");
  const logoBuffer = await fetchImage(store.logo);
  const doc = new PDFDocument();
  // Render content
  doc.image(logoBuffer, { width: 50 });
  doc.fontSize(25).text(store.name, { align: "center" });
  doc.moveDown();
  doc.fontSize(18).text("Top 5 Priciest Books");
  books.forEach((b) => doc.fontSize(12).text(`${b.bookName} - $${b.price}`));

  doc.moveDown();
  doc.fontSize(18).text("Top 5 Prolific Authors");
  authors.forEach((a) =>
    doc.fontSize(12).text(`${a.authorName} (${a.bookCount} books)`)
  );

  doc.end();
  return doc;
};
