import { createWorkbook, editWorkbook, findAllWorkbooks, findWorkbook, removeWorkbook } from '@/services/WorkbooksService';
import { typedAsyncWrapper } from '@/utils';

export const get = typedAsyncWrapper<"/workbooks", "get">(async (req, res) => {
  const userId = req.userId;
  const workbooks = await findAllWorkbooks({ creator_id: userId });

  res.status(200).send(workbooks);
});

export const getAll = typedAsyncWrapper<"/workbooks/all", "get">(async (req, res) => {
  const userId = req.userId;
  const workbooks = await findAllWorkbooks({ creator_id: userId });

  res.status(200).send(workbooks);
});

export const post = typedAsyncWrapper<"/workbooks", "post">(async (req, res) => {
  const workbookName = req.body.workbookName;
  const userId = req.userId;
  const wid = await createWorkbook({
    name: workbookName,
    creator_id: userId,
  });

  const created = await findWorkbook({ wid });

  res.status(200).send(created);
});

export const put = typedAsyncWrapper<"/workbooks", "put">(async (req, res) => {
  const workbookName = req.body.newWorkbookName;
  const wid = req.body.wid;

  await editWorkbook(wid, { name: workbookName });

  const edited = await findWorkbook({ wid });

  res.status(200).send(edited);
});

export const del = typedAsyncWrapper<"/workbooks", "delete">(async (req, res) => {
  const wid = req.body.wid;

  await removeWorkbook(wid);
  const allList = await findAllWorkbooks({});

  res.status(200).send(allList);
});

export default {
  get,
  getAll,
  post,
  put,
  del,
}