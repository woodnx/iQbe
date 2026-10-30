import type {
  WorkbookDTO as ApiWorkbookDTO,
  WorkbooksResponseDTO as ApiWorkbooksResponseDTO,
} from "@/types/dto.js";

import Workbook from "@/domains/Workbook/index.js";

type WorkbookDTO = ApiWorkbookDTO;
export type WorkbooksDTO = ApiWorkbooksResponseDTO;

export type WorkbookDateInput = Date | string | null;

export const normalizeWorkbookDate = (date: WorkbookDateInput): Date | null => {
  if (!date) return null;

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

  // string のとき
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const toWorkbookDTO = (workbook: Workbook): WorkbookDTO => ({
  wid: workbook.wid,
  name: workbook.name,
  date: workbook.date || undefined,
  creatorId: workbook.creatorUid,
  levelId: workbook.levelId,
  color: workbook.color,
  total: workbook.total,
  corrects: workbook.corrects,
  wrongs: workbook.wrongs,
  ignored: workbook.ignored,
  lastPracticedAt: workbook.lastPracticedAt,
});

export const toWorkbooksDTO = (workbooks: Workbook[]): WorkbooksDTO =>
  workbooks.map((workbook) => toWorkbookDTO(workbook));
