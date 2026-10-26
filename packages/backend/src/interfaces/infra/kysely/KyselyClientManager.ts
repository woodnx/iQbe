import { AsyncLocalStorage } from "node:async_hooks";
import type { Kysely, Transaction } from "kysely";
import { db } from "@/database.js";
import type { DB } from "@/db/types.js";
import type IDataAccessClientManager from "../shared/IDataAccessClientManager.js";

export default class KyselyClientManager
  implements IDataAccessClientManager<Kysely<DB> | Transaction<DB>>
{
  private readonly storage = new AsyncLocalStorage<Transaction<DB>>();

  getClient(): Kysely<DB> | Transaction<DB> {
    return this.storage.getStore() ?? db;
  }

  withTransaction<T>(
    trx: Transaction<DB>,
    callback: () => Promise<T>,
  ): Promise<T> {
    return this.storage.run(trx, callback);
  }
}
