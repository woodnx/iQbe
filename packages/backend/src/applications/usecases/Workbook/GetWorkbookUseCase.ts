import type { WorkbookResponseDTO as ApiWorkbookResponseDTO } from "@/types/dto.js";
import { ApiError } from "@/http/ApiError.js";

import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository.js";

import { toWorkbookDTO } from "./WorkbookMapper.js";

type WorkbookDTO = ApiWorkbookResponseDTO;

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
