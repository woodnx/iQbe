import { createFileRoute } from "@tanstack/react-router";

import WorkbookDetail from "@/pages/workbook-detail";

export const Route = createFileRoute("/workbook/$wid")({
  component: WorkbookDetail,
});
