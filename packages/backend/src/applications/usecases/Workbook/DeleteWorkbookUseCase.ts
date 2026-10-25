import IWorkbookRepository from "@/domains/Workbook/IWorkbookRepository.js";

import { toWorkbooksDTO, WorkbooksDTO } from "./WorkbookMapper.js";

export type DeleteWorkbookUseCaseCommand = {
  uid: string;
  wid: string;
};

export class DeleteWorkbookUseCase {
  constructor(private workbookRepository: IWorkbookRepository) {}

  async execute(command: DeleteWorkbookUseCaseCommand): Promise<WorkbooksDTO> {
    await this.workbookRepository.delete(command.wid);
    const workbooks = await this.workbookRepository.findManyByUid(command.uid);

    return toWorkbooksDTO(workbooks);
  }
}
