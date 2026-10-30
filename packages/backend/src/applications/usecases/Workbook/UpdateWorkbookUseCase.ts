import type { WorkbookResponseDTO as ApiWorkbookResponseDTO } from "@/types/dto.js";
import { ApiError } from "@/http/ApiError.js";

import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository.js";

import { normalizeWorkbookDate, WorkbookDateInput } from "./WorkbookMapper.js";

type WorkbookDTO = ApiWorkbookResponseDTO;

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

    const date = normalizeWorkbookDate(command.date);
    workbook.rename(command.name);
    workbook.setDate(date);

    await this.workbookRepository.update(workbook);

    return {
      wid: command.wid,
      name: command.name,
      date,
      creatorId: command.uid,
      levelId: null,
      color: null,
      total: workbook.total,
      corrects: workbook.corrects,
      wrongs: workbook.wrongs,
      ignored: workbook.ignored,
      lastPracticedAt: workbook.lastPracticedAt,
    };
  }
}
