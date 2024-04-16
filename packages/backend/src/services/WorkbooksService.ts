import { db } from '@/database';
import { workbooks } from '@/db/types';
import { InsertWorkbook, UpdateWorkbook, deleteWorkbook, generateWid, insertWorkbook, selectAllWorkbooks, selectWorkbook, updateWorkbook } from '@/models/Workbooks';
import { format } from '@/plugins/day';

type CreateWorkbook = Omit<InsertWorkbook, "wid">;

export const findWorkbook = async (option: Partial<workbooks>) => {
  const workbook = await selectWorkbook(option);

  return {
    ...workbook,
    date: !!workbook?.date ? format(workbook.date) : null
  };
}

export const findAllWorkbooks = async (option: Partial<workbooks>) => {
  const workbooks = await selectAllWorkbooks(option);

  return workbooks.map(workbook => ({
    ...workbook,
    date: !!workbook?.date ? format(workbook.date) : null
  }));
}

export const createWorkbook = (value: CreateWorkbook) => (
  db.transaction().execute(async (trx) => {
    const wid = await generateWid();
    await insertWorkbook(trx, {
      ...value,
      wid,
    });
    return wid;
  })
);

export const editWorkbook = (wid: string, value: UpdateWorkbook) => (
  db.transaction().execute(async (trx) => {
    await updateWorkbook(trx, wid, {
      ...value,
    });

    return wid;
  })
);

export const removeWorkbook = (wid: string) => (
  db.transaction().execute(async (trx) => {
    await deleteWorkbook(trx, wid);
    return wid;
  })
);