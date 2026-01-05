import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/db/connect';
export interface Book extends Model {
  id: number;
  name: string;
  pages: number;
  authorId: number;
}
const BookModel = sequelize.define(
  'Book',
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
    pages: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Authors', // table name
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT', // or CASCADE if you prefer
    },
  },
  // eslint-disable-next-line prettier/prettier
  { timestamps: true },
);

export default BookModel;
