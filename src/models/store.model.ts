import { DataTypes, Model } from 'sequelize';
import sequelize from '../utils/db/connect';
export interface Store extends Model {
  id: number;
  name: string;
  address: string;
  logo: string;
}
const StoreModel = sequelize.define(
  'Store',
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
    address: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    logo: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['name', 'address'],
      },
    ],
  },
);

export default StoreModel;
