import { Dialect, Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import logger from '../logger';
dotenv.config();
const {
  NODE_ENV,
  DB_HOST,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DIALECT,
  DB_NAME,
  DB_NAME_TEST,
} = process.env;
const databaseName = NODE_ENV == 'test' ? DB_NAME_TEST : DB_NAME;
const sequelize = new Sequelize(
  String(databaseName),
  String(DB_USERNAME),
  String(DB_PASSWORD),
  {
    dialect: DB_DIALECT as Dialect,
    host: String(DB_HOST),
    logging: (msg) => logger.info(`Sequelize: ${msg}`),
  },
);

export default sequelize;
