import type ITransactionManager from "@/applications/shared/ITransactionManager.js";
import type { TransactionOptions } from "@/applications/shared/ITransactionManager.js";
import { db } from "@/database.js";
import KyselyClientManager from "./KyselyClientManager.js";

export default class KyselyTransactionManager implements ITransactionManager {
  constructor(private clientManager: KyselyClientManager) {}

  async begin<T>(
    callback: () => Promise<T>,
    options: TransactionOptions = {},
  ): Promise<T> {
    const active = this.clientManager.getActiveTransaction();
    if (active) {
      // 実行中のトランザクションの分離レベルは MySQL では変えられない。指定を無視して
      // 外側に相乗りすると、前提と違う読み取りで黙って誤った値を書き得るため、ここで止める。
      if (
        options.isolationLevel !== undefined &&
        options.isolationLevel !== active.isolationLevel
      ) {
        throw new Error(
          `A nested transaction requires "${options.isolationLevel}", but the outer transaction uses "${active.isolationLevel ?? "the server default"}"`,
        );
      }
      return callback();
    }
    const isolationLevel = options.isolationLevel ?? null;
    const transaction = isolationLevel
      ? db.transaction().setIsolationLevel(isolationLevel)
      : db.transaction();
    return transaction.execute((trx) =>
      this.clientManager.withTransaction(trx, callback, isolationLevel),
    );
  }
}
