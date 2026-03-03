import { Kysely, MysqlDialect } from "kysely";
import { createPool } from "mysql2";
import { DB } from "./db/types";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not defined");
}

const dialect = new MysqlDialect({
  pool: createPool(databaseUrl),
});

export const db = new Kysely<DB>({
  dialect,
});
