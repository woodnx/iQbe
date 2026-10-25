import { Kysely, Transaction } from "kysely";

import { db } from "@/database.js";
import { DB } from "@/db/types.js";
import IDataAccessClientManager from "@/interfaces/infra/shared/IDataAccessClientManager.js";

type Client = Kysely<DB> | Transaction<DB>;

export default class KyselyClientManager
  implements IDataAccessClientManager<Client>
{
  private client: Client = db;

  setClient(client: Client): void {
    this.client = client;
  }

  getClient(): Client {
    return this.client;
  }
}
