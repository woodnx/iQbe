import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository.js";

import { toWorkbooksDTO, WorkbooksDTO } from "./WorkbookMapper.js";

export type GetAllWorkbooksUseCaseCommand = {
  uid: string;
};

export class GetAllWorkbooksUseCase {
  constructor(private workbookRepository: IWorkbookRepository) {}

  async execute(command: GetAllWorkbooksUseCaseCommand): Promise<WorkbooksDTO> {
    const workbooks = await this.workbookRepository.findManyByUid(command.uid);

    return toWorkbooksDTO(workbooks);
  }
}
