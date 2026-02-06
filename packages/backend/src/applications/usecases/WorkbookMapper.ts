import { components } from "api/schema";

import Workbook from "@/domains/Workbook";

type WorkbookDTO = components["schemas"]["Workbook"];
export type WorkbooksDTO =
  components["responses"]["WorkbooksResponse"]["content"]["application/json"];

export type WorkbookDateInput = Date | string | null;

export const normalizeWorkbookDate = (date: WorkbookDateInput): Date | null => {
  if (!date) return null;

  if (date instanceof Date) {
    return Number.isNaN(date.getTime()) ? null : date;
  }

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
});

export const toWorkbooksDTO = (workbooks: Workbook[]): WorkbooksDTO =>
  workbooks.map((workbook) => toWorkbookDTO(workbook));
