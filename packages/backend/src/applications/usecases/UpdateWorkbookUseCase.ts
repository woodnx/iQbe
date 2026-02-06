import { ApiError } from "api";
import { components } from "api/schema";

import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository";

import {
  normalizeWorkbookDate,
  WorkbookDateInput,
} from "./WorkbookMapper";

type WorkbookDTO = components["responses"]["WorkbookResponse"]["content"]["application/json"];

export type UpdateWorkbookUseCaseCommand = {
  uid: string;
  wid: string;
  name: string;
  date: WorkbookDateInput;
};

export class UpdateWorkbookUseCase {
  constructor(private workbookRepository: IWorkbookRepository) {}

  async execute(command: UpdateWorkbookUseCaseCommand): Promise<WorkbookDTO> {
    const workbook = await this.workbookRepository.findByWid(
      command.wid,
      command.uid,
    );

    if (!workbook) throw new ApiError().invalidParams();

    workbook.rename(command.name);
    workbook.setDate(normalizeWorkbookDate(command.date));

    await this.workbookRepository.update(workbook);

    return {
      wid: command.wid,
      name: command.name,
      date: null,
      creatorId: command.uid,
      levelId: null,
      color: null,
    };
  }
}
