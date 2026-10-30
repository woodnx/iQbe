import type ITransactionManager from "@/applications/shared/ITransactionManager.js";
import { db } from "@/database.js";
import KyselyClientManager from "./KyselyClientManager.js";

export default class KyselyTransactionManager implements ITransactionManager {
  constructor(private clientManager: KyselyClientManager) {}

  async begin<T>(callback: () => Promise<T>): Promise<T> {
    if (this.clientManager.getClient().isTransaction) return callback();
    return db
      .transaction()
      .execute((trx) => this.clientManager.withTransaction(trx, callback));
  }
}
