import { components } from "api/schema";

import Workbook from "@/domains/Workbook";
import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository";
import WorkbookService from "@/domains/Workbook/WorkbookService";

import {
  normalizeWorkbookDate,
  WorkbookDateInput,
} from "./WorkbookMapper";

type WorkbookDTO =
  components["responses"]["WorkbookResponse"]["content"]["application/json"];

export type CreateWorkbookUseCaseCommand = {
  uid: string;
  name: string;
  date: WorkbookDateInput;
};

export class CreateWorkbookUseCase {
  constructor(
    private workbookRepository: IWorkbookRepository,
    private workbookService: WorkbookService,
  ) {}

  async execute(command: CreateWorkbookUseCaseCommand): Promise<WorkbookDTO> {
    const wid = this.workbookService.generateWid();
    const normalizedDate = normalizeWorkbookDate(command.date);
    const workbook = new Workbook(
      wid,
      command.name,
      normalizedDate,
      command.uid,
      null,
      null,
    );

    await this.workbookRepository.save(workbook);

    return {
      wid,
      name: command.name,
      date: normalizedDate || null,
      creatorId: command.uid,
      levelId: null,
      color: null,
    };
  }
}
