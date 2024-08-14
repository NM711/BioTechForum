import DBStructure from "./database.types";
import { createPool } from 'mysql2'
import { Kysely, MysqlDialect } from 'kysely'

const dialect = new MysqlDialect({
  pool: createPool({
    database: process.env.DATABASE_NAME as string,
    host: process.env.DATABASE_HOST as string,
    user: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASSWORD as string,
    port: process.env.DATABASE_PORT as unknown as number,
    connectionLimit: 1
  })
});

const Client = new Kysely<DBStructure.Database>({
  dialect
});

export default Client;
