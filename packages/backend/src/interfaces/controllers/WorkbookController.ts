import { ApiError } from "api";

import Workbook from "@/domains/Workbook";
import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository";
import WorkbookService from "@/domains/Workbook/WorkbookService";
import { typedAsyncWrapper } from "@/utils";

export default class WorkbookController {
  constructor(
    private workbookRepository: IWorkbookRepository,
    private workbookService: WorkbookService,
  ) {}

  get() {
    return typedAsyncWrapper<"/workbooks", "get">(async (req, res) => {
      const uid = req.user.uid;
      const workbooks = await this.workbookRepository.findManyByUid(uid);

      res.status(200).send(
        workbooks.map((w) => ({
          wid: w.wid,
          name: w.name,
          date: w.date || undefined,
          creatorId: w.creatorUid,
          levelId: w.levelId,
          color: w.color,
        })),
      );
    });
  }

  getFromWid() {
    return typedAsyncWrapper<"/workbooks/{wid}", "get">(async (req, res) => {
      const uid = req.user.uid;
      const wid = req.params.wid;

      const workbook = await this.workbookRepository.findByWid(wid);

      if (!workbook) throw new ApiError().invalidParams("workbook not found");

      res.status(200).send({
        wid: workbook.wid,
        name: workbook.name,
        date: workbook.date || undefined,
        creatorId: workbook.creatorUid,
        levelId: workbook.levelId,
        color: workbook.color,
      });
    });
  }

  getAll() {
    return typedAsyncWrapper<"/workbooks/all", "get">(async (req, res) => {
      const uid = req.user.uid;
      const workbooks = await this.workbookRepository.findManyByUid(uid);

      res.status(200).send(
        workbooks.map((w) => ({
          wid: w.wid,
          name: w.name,
          date: w.date || undefined,
          creatorId: w.creatorUid,
          levelId: w.levelId,
          color: w.color,
        })),
      );
    });
  }

  post() {
    return typedAsyncWrapper<"/workbooks", "post">(async (req, res) => {
      const uid = req.user.uid;
      const name = req.body.name;
      const date = req.body.published || null;

      const wid = this.workbookService.generateWid();
      const workbook = new Workbook(wid, name, date, uid, null, null);

      await this.workbookRepository.save(workbook);

      res.status(200).send({
        wid,
        name,
        date: date || null,
        creatorId: uid,
        levelId: null,
        color: null,
      });
    });
  }

  put() {
    return typedAsyncWrapper<"/workbooks/{wid}", "put">(async (req, res) => {
      const uid = req.user.uid;
      const wid = req.params.wid;
      const name = req.body.name;
      const date = req.body.published || null;

      const workbook = await this.workbookRepository.findByWid(wid);
      if (!workbook) throw new ApiError().invalidParams();

      workbook.rename(name);
      workbook.setDate(date);

      await this.workbookRepository.update(workbook);

      res.status(200).send({
        wid,
        name,
        date: null,
        creatorId: uid,
        levelId: null,
        color: null,
      });
    });
  }

  delete() {
    return typedAsyncWrapper<"/workbooks/{wid}", "delete">(async (req, res) => {
      const uid = req.user.uid;
      const wid = req.params.wid;

      await this.workbookRepository.delete(wid);
      const workbooks = await this.workbookRepository.findManyByUid(uid);

      res.status(200).send(
        workbooks.map((w) => ({
          wid: w.wid,
          name: w.name,
          date: w.date || undefined,
          creatorId: w.creatorUid,
          levelId: w.levelId,
          color: w.color,
        })),
      );
    });
  }
}
