import ITransactionManager from "@/applications/shared/ITransactionManager.js";
import KyselyClientManager from "./KyselyClientManager.js";
import { db } from "@/database.js";

export default class KyselyTransactionManager implements ITransactionManager {
  constructor(private clientManager: KyselyClientManager) {}

  async begin<T>(callback: () => Promise<T>): Promise<T | undefined> {
    return await db.transaction().execute(async (trx) => {
      this.clientManager.setClient(trx);

      const res = await callback();

      this.clientManager.setClient(db);

      return res;
    });
  }
}
