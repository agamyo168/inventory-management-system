import { DataTypes, Model } from "sequelize";
import sequelize from "../utils/db/connect";
export interface Author extends Model {
  id: number;
  name: string;
}
const Author = sequelize.define(
  "Author",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  },
  // eslint-disable-next-line prettier/prettier
  { timestamps: true }
);

export default Author;
