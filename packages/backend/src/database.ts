import { DB } from  './db/types';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';

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