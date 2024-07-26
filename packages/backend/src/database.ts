import { DB } from  './db/types';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';

const dialect = new MysqlDialect({
  pool: createPool({
    database: process.env.MARIADB_DATABASE,
    user: process.env.MARIADB_USER,
    password: process.env.MARIADB_PASSWORD,
    host: process.env.MARIADB_HOST,
  }),
});

export const db = new Kysely<DB>({
  dialect,
});