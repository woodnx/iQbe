import { DB } from  './db/types';
import { createPool } from 'mysql2';
import { DatabaseIntrospector, Dialect, DialectAdapter, Driver, Kysely, MysqlAdapter, MysqlDialectConfig, MysqlDriver, MysqlIntrospector, MysqlQueryCompiler, QueryCompiler } from 'kysely';
import db_info from './db-info.json';

class MariaDBAdapter extends MysqlAdapter {
  get supportsReturning(): boolean {
    return true
  }
}

class MariaDBDialect implements Dialect {
  readonly #config: MysqlDialectConfig

  constructor(config: MysqlDialectConfig) {
    this.#config = config
  }

  createDriver(): Driver {
    return new MysqlDriver(this.#config)
  }

  createQueryCompiler(): QueryCompiler {
    return new MysqlQueryCompiler()
  }

  createAdapter(): DialectAdapter {
    return new MariaDBAdapter()
  }

  createIntrospector(db: Kysely<any>): DatabaseIntrospector {
    return new MysqlIntrospector(db)
  }
}

const dialect = new MariaDBDialect({
  pool: createPool(db_info),
});

export const db = new Kysely<DB>({
  dialect,
});