import ITransactionManager from "@/applications/shared/ITransactionManager";
import KyselyClientManager from "./KyselyClientManager";
import { db } from "@/database";

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
