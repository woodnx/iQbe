import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository.js";

import { toWorkbooksDTO, WorkbooksDTO } from "./WorkbookMapper.js";

export type GetWorkbooksUseCaseCommand = {
  uid: string;
};

export class GetWorkbooksUseCase {
  constructor(private workbookRepository: IWorkbookRepository) {}

  async execute(command: GetWorkbooksUseCaseCommand): Promise<WorkbooksDTO> {
    const workbooks = await this.workbookRepository.findManyByUid(command.uid);

    return toWorkbooksDTO(workbooks);
  }
}
