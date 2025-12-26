import dotenv from "dotenv";
import express from "express";
import { StatusCodes } from "http-status-codes";

import { errorHandlerMiddleware } from "./middlewares/error";
import notFoundMiddleware from "./middlewares/notfound.middleware";
import sequelize from "./utils/db/connect";
import logger from "./utils/logger";
import Store from "./models/store.model";
import StoreBook from "./models/store-book.model";
import Book from "./models/book.mode";
import Author from "./models/author.model";
import routes from "./routes/index";
dotenv.config();
const app = express();
const port = process.env.PORT || "3000";

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));

app.get("/healthcheck", (req, res) => {
  res.status(StatusCodes.OK).json({
    success: true,
    msg: "Response",
  });
});

//All Routes
app.use("/api/", routes);

//Route Not Found redirction
app.use(notFoundMiddleware);

//Error handling middleware
app.use(errorHandlerMiddleware);

const start = async () => {
  try {
    await sequelize.sync({ force: true }); //TODO: disable it when you write migration files!!
    Store.belongsToMany(Book, {
      through: StoreBook,
      foreignKey: "storeId",
    });
    Book.belongsToMany(Store, {
      through: StoreBook,
      foreignKey: "bookId",
    });
    Book.belongsTo(Author, {
      foreignKey: "authorId",
    });

    Author.hasMany(Book, {
      foreignKey: "authorId",
    });
    logger.info("DB connected");
    app.listen(port, () => {
      logger.info(`App is running at http://localhost:${port}`);
    });
  } catch (err) {
    logger.error(err);
  }
};
start();
export default app;
