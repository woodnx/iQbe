import { AsyncLocalStorage } from "node:async_hooks";
import type { Kysely, Transaction } from "kysely";
import type { TransactionOptions } from "@/applications/shared/ITransactionManager.js";
import { db } from "@/database.js";
import type { DB } from "@/db/types.js";
import type IDataAccessClientManager from "../shared/IDataAccessClientManager.js";

type IsolationLevel = NonNullable<TransactionOptions["isolationLevel"]>;

export type ActiveTransaction = Readonly<{
  trx: Transaction<DB>;
  /** 指定せずに始めたら null（MySQL サーバーの既定値で、コードからは確定できない）。 */
  isolationLevel: IsolationLevel | null;
}>;

export default class KyselyClientManager implements IDataAccessClientManager<
  Kysely<DB> | Transaction<DB>
> {
  private readonly storage = new AsyncLocalStorage<ActiveTransaction>();

  getClient(): Kysely<DB> | Transaction<DB> {
    return this.storage.getStore()?.trx ?? db;
  }

  /** 実行中のトランザクション。トランザクションの外では null。 */
  getActiveTransaction(): ActiveTransaction | null {
    return this.storage.getStore() ?? null;
  }

  withTransaction<T>(
    trx: Transaction<DB>,
    callback: () => Promise<T>,
    isolationLevel: IsolationLevel | null = null,
  ): Promise<T> {
    return this.storage.run({ trx, isolationLevel }, callback);
  }
}
