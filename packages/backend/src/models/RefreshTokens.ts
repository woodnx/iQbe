import { Transaction, sql } from 'kysely';
import { DB } from '@/db/types';
import dayjs from '@/plugins/day';
import { generateRefreshToken } from '@/utils';
import { db } from '@/database';

export const findRefreshToken = (userId: number) => db
.selectFrom('refresh_tokens')
.select(({ fn, val }) => [
  fn<string>('concat', [
    sql`SUBSTRING(HEX(token), 1, 8)`,
    val('-'),
    sql`SUBSTRING(HEX(token), 9, 4)`,
    val('-'),
    sql`SUBSTRING(HEX(token), 13, 4)`,
    val('-'),
    sql`SUBSTRING(HEX(token), 17, 4)`,
    val('-'),
    sql`SUBSTRING(HEX(token), 21, 12)`,
  ]).as('token'),
  'expired'
])
.where('user_id', '=', userId)
.orderBy('id desc')
.executeTakeFirst()

export const createRefreshToken = async (trx: Transaction<DB>, userId: number): Promise<string> => {
  const refreshToken = await generateRefreshToken();
  const expDate = dayjs().add(1, 'year').toDate();

  await trx
  .insertInto('refresh_tokens')
  .values({ 
    user_id: userId,
    token: sql<Buffer>`UNHEX(REPLACE(${refreshToken}, '-', ''))`,
    expDate,
  })
  .execute();

  return refreshToken;
}


