import { Transaction } from 'kysely';
import Hashids from 'hashids';
import { DB } from '@/db/types';
import { db } from '@/database';

const inviteCodeHash = new Hashids(
  /* salt: */      process.env.INVITE_CODE_SALT,
  /* minLength: */ 8,
  /* alphabet: */  process.env.INVITE_CODE_ALPHABET,
);

export const generateInviteCode = async () => {
  const totalCodes = await db.selectFrom('invite_codes').select('id').orderBy('id').limit(1).execute();
  const lastCode = totalCodes.length !== 0 ? totalCodes[0].id : 0;
  const newInviteCodeId = [ ...Array(lastCode + 1).keys() ];
  return inviteCodeHash.encode(newInviteCodeId);
}

export const searchInviteCode = (inviteCode: string) => (
  db.selectFrom('invite_codes')
  .selectAll()
  .where('code', '=', inviteCode)
  .executeTakeFirstOrThrow()
);

export const useInviteCode = (trx: Transaction<DB>, inviteCode: string) => (
  trx.updateTable('invite_codes')
  .set({ used: 1 })
  .where('code', '=', inviteCode)
  .executeTakeFirstOrThrow()
);

export const insertInviteCode = (trx: Transaction<DB>, inviteCode: string) => (
  trx.insertInto('invite_codes')
  .values({
    code: inviteCode
  })
  .execute()
);