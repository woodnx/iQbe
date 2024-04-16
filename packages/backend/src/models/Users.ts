import { Transaction } from "kysely";
import { User } from "api/types";
import { db } from "@/database";
import { DB } from "@/db/types";

export type InsertUser = {
  uid: string,
  nickname?: string | undefined,
  username: string,
  email: string | undefined,
  passwd: string,
  modified: string,
  created: string,
}

export type UpdateUser = Omit<InsertUser, "uid">;

export const findUser = ({
  uid,
  username,
  email,
}: Partial<User>) => {
  let query = db.selectFrom('users').selectAll()
  
  if (uid) query = query.where('uid', '=', uid);
  if (username) query = query.where('username', '=', username);
  if (email) query = query.where('email', '=', email);

  return query.executeTakeFirst();
}

export const insertUser = (trx: Transaction<DB>, userData: InsertUser) => (
  trx
  .insertInto('users')
  .values(userData)
  .executeTakeFirstOrThrow()
);

export const updateUser = (trx: Transaction<DB>, uid: string, userData: UpdateUser) => (
  trx
  .updateTable('users')
  .set(userData)
  .where('uid', '=', uid)
  .execute()
);