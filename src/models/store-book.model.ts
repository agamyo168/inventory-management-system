import { DataTypes, Model } from "sequelize";
import sequelize from "../utils/db/connect";
export interface StoreBook extends Model {
  storeId: number;
  bookId: string;
  price: number;
  copies: number;
  isSoldOut: boolean;
}
const StoreBookModel = sequelize.define(
  "StoreBook",
  {
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Stores",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: "Books",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    copies: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isSoldOut: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
  },
  // eslint-disable-next-line prettier/prettier
  { timestamps: true }
);

export default StoreBookModel;
