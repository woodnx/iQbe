import { DB } from  './db/types';
import { createPool } from 'mysql2';
import { Kysely, MysqlDialect } from 'kysely';
import db_info from './db-info.json';

const dialect = new MysqlDialect({
  pool: createPool(db_info),
});

export const db = new Kysely<DB>({
  dialect,
});