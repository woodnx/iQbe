import { ApiError } from "@/http/ApiError.js";
import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository.js";

import { toWorkbooksDTO, WorkbooksDTO } from "./WorkbookMapper.js";

export type DeleteWorkbookUseCaseCommand = {
  uid: string;
  wid: string;
};

export class DeleteWorkbookUseCase {
  constructor(private workbookRepository: IWorkbookRepository) {}

  async execute(command: DeleteWorkbookUseCaseCommand): Promise<WorkbooksDTO> {
    if (!(await this.workbookRepository.delete(command.wid, command.uid)))
      throw new ApiError().notFound();
    const workbooks = await this.workbookRepository.findManyByUid(command.uid);

    return toWorkbooksDTO(workbooks);
  }
}
