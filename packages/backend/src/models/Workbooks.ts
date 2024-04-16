import { db } from '@/database';
import { DB, workbooks } from '@/db/types';
import { generateHashId } from '@/utils';
import { Transaction } from 'kysely';

export type InsertWorkbook = {
  wid: string,
  name: string,
  date?: string | undefined,
  level_id?: number | undefined,
  creator_id: number,
}

export type UpdateWorkbook = Partial<Omit<InsertWorkbook, "wid">>

export const generateWid = async () => {
  const lastWorkbook = await db.selectFrom('workbooks').select('id').orderBy('id desc').limit(1).execute();
  const lastlastWorkbookId = lastWorkbook.length !== 0 ? lastWorkbook[0].id : 0;
  return generateHashId(lastlastWorkbookId + 1);
}

export const selectAllWorkbooks = ({
  wid,
  creator_id,
}: Partial<workbooks>) => {
  let query = db.selectFrom('workbooks')
  .innerJoin('levels', 'workbooks.level_id', 'levels.id')
  .innerJoin('users', 'creator_id', 'users.id')
  .select([
    'workbooks.name as name', 
    'wid', 
    'workbooks.date',
    'users.uid as creatorId', 
    'levels.color as color',
    'level_id as levelId',
  ]);

  if (creator_id) query = query.where('workbooks.creator_id', '=', creator_id);
  if (wid) query = query.where('workbooks.wid', '=', wid);

  return query.execute();
}

export const selectWorkbook = ({
  wid,
  creator_id,
}: Partial<workbooks>) => {
  let query = db.selectFrom('workbooks')
  .innerJoin('levels', 'workbooks.level_id', 'levels.id')
  .innerJoin('users', 'creator_id', 'users.id')
  .select([
    'workbooks.name as name', 
    'wid', 
    'workbooks.date',
    'users.uid as creatorId', 
    'levels.color as color',
    'level_id as levelId',
  ]);

  if (creator_id) query = query.where('workbooks.creator_id', '=', creator_id);
  if (wid) query = query.where('workbooks.wid', '=', wid);

  return query.executeTakeFirstOrThrow();
}

export const insertWorkbook = (trx: Transaction<DB>, value: InsertWorkbook) => (
  trx.insertInto("workbooks")
  .values(value)
  .executeTakeFirst()
);

export const updateWorkbook =  (trx: Transaction<DB>, wid: string, value: UpdateWorkbook) => (
  trx.updateTable('workbooks')
  .set(value)
  .where('wid', '=', wid)
  .execute()
)

export const deleteWorkbook = (trx: Transaction<DB>, wid: string) => (
  trx.deleteFrom('workbooks')
  .where('wid', '=', wid)
  .execute()
);