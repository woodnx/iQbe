import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2/promise";
import { DB } from "./db/types";

const dialect = new MysqlDialect({
  pool: createPool({
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    host: process.env.DATABASE_HOST,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});
