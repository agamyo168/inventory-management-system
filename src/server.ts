import dotenv from "dotenv";
import express from "express";
import { StatusCodes } from "http-status-codes";

import { errorHandlerMiddleware } from "./middlewares/error";
import notFoundMiddleware from "./middlewares/notfound.middleware";
import sequelize from "./utils/db/connect";
import logger from "./utils/logger";
import routes from "./routes/index";
import StoreModel from "./models/store.model";
import StoreBookModel from "./models/store-book.model";
import BookModel from "./models/book.mode";
import AuthorModel from "./models/author.model";
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
    await sequelize
      // { force: true }
      .sync(); //TODO: disable it when you write migration files!!
    StoreModel.belongsToMany(BookModel, {
      through: StoreBookModel,
      foreignKey: "storeId",
    });
    BookModel.belongsToMany(StoreModel, {
      through: StoreBookModel,
      foreignKey: "bookId",
    });
    BookModel.belongsTo(AuthorModel, {
      foreignKey: "authorId",
    });
    AuthorModel.hasMany(BookModel, {
      foreignKey: "authorId",
    });
    StoreBookModel.belongsTo(BookModel, { foreignKey: "bookId" });
    StoreBookModel.belongsTo(StoreModel, { foreignKey: "storeId" });
    BookModel.hasMany(StoreBookModel, { foreignKey: "bookId" });
    StoreModel.hasMany(StoreBookModel, { foreignKey: "storeId" });

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
