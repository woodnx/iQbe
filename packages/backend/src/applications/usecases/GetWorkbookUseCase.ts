import { ApiError } from "api";
import { components } from "api/schema";

import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository";

import { toWorkbookDTO } from "./WorkbookMapper";

type WorkbookDTO = components["responses"]["WorkbookResponse"]["content"]["application/json"];

export type GetWorkbookUseCaseCommand = {
  uid: string;
  wid: string;
};

export class GetWorkbookUseCase {
  constructor(private workbookRepository: IWorkbookRepository) {}

  async execute(command: GetWorkbookUseCaseCommand): Promise<WorkbookDTO> {
    const workbook = await this.workbookRepository.findByWid(
      command.wid,
      command.uid,
    );

    if (!workbook) throw new ApiError().invalidParams("workbook not found");

    return toWorkbookDTO(workbook);
  }
}
