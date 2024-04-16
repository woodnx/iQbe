import Hashids from 'hashids';
import { User } from "api/types";
import { db } from '@/database';
import { useInviteCode } from '@/models/InviteCode';
import { createRefreshToken } from '@/models/RefreshTokens';
import { findUser, insertUser, updateUser } from "@/models/Users";
import dayjs, { format } from '@/plugins/day';

type CreateUser = {
  uid: string,
  nickname?: string | undefined,
  username: string,
  email: string | undefined,
  passwd: string,
  inviteCode?: string | undefined | null,
}

type EditUser = Omit<CreateUser, "uid">;

const hashids = new Hashids(process.env.HASHIDS_SALT, 28, process.env.HASHIDS_ALPHABET);

export const generateUid = async (id?: number | undefined) => {
  const userIds = await db.selectFrom('users').select('id').orderBy('id desc').limit(1).execute();
  const lastUser = userIds.length !== 0 ? userIds[0].id : 0;
  const newUserId = id 
  ? [ ...Array(id).keys() ]
  : [ ...Array(lastUser + 1).keys() ];

  return hashids.encode(newUserId);
};


export const findSendUser = (options: Partial<User>) => (
  findUser(options)
  .then((user) => {
    if (!user) return undefined;

    return {
      ...user,
      modified: format(user.modified),
      created: format(user.created),
    };
  })
);

export const createUser = ({
  uid,
  nickname,
  username,
  email,
  passwd,
  inviteCode,
}: CreateUser) => (
  db.transaction().execute(async (trx) => {
    const created = format(dayjs().toDate());

    await insertUser(trx, {
      uid,
      nickname,
      username,
      email,
      passwd,
      modified: created,
      created,
    });

    if (process.env.REQUIRE_INVITE_CODE && !!inviteCode) {
      await useInviteCode(trx, inviteCode);
    }

    const dbUser = await findUser({ username });
    if (!dbUser) return;
    const { id, passwd: _, ...user } = dbUser;

    const refreshToken = await createRefreshToken(trx, id);

    const sendUser = {
      ...user,
      modified: format(user.modified),
      created: format(user.created),
    }

    return { user: sendUser, refreshToken };
  })
);

export const editUser = (uid: string, data: EditUser) => (
  db.transaction().execute(async (trx) => {
    const created = format(dayjs().toDate());

    await updateUser(trx, uid, {
      ...data,
      created,
      modified: created
    });

    const dbUser = await findUser({ uid });
    if (!dbUser) return;
    const { id, passwd: _, ...user } = dbUser;

    const refreshToken = await createRefreshToken(trx, id);

    const sendUser = {
      ...user,
      modified: format(user.modified),
      created: format(user.created),
    }

    return { user: sendUser, refreshToken };
  })
);

export default class UsersService {
  
}
