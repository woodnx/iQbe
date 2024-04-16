import { db } from "@/database";
import Hashids from 'hashids';
import { Mylist } from "api/types";

type CreateData = {
  mid: string,
  name: string,
  created: string,
  user_id: number,
  attr: number,
}

const hashids = new Hashids(process.env.HASHIDS_SALT, 10, process.env.HASHIDS_ALPHABET);

export const Mylists = {
  own(userId: number) {
    return db.selectFrom('mylists')
    .selectAll()
    .where('user_id', '=', userId)
    .execute();
  },
  update(id: number, data: Partial<Mylist>) {
    return db.updateTable('mylists')
    .set(data)
    .where('id', '=', id)
    .execute();
  },
  create(data: CreateData) {
    return db.insertInto('mylists')
    .values(data)
    .executeTakeFirst();
  },
  async generateMid() {
    const mylistsId = await db.selectFrom('mylists').select('id').orderBy('id desc').limit(1).execute();
    const lastMylistId = mylistsId.length !== 0 ? mylistsId[0].id : 0;
    return hashids.encode(lastMylistId + 1);
  }
}