import { db } from '@/database';
import { generateInviteCode, insertInviteCode, searchInviteCode } from '@/models/InviteCode';

export const existInviteCode = async (inviteCode: string) => {
  const dbCode = await searchInviteCode(inviteCode);

  if (dbCode.used) {
    return 0;
  } 
  else if (!inviteCode) {
    return -1;
  }
  else {
    return 1;
  }
}

export const createInviteCode = async () => (
  db.transaction().execute(async trx => {
    const code = await generateInviteCode();

    insertInviteCode(trx, code);

    return code;
  })
)
