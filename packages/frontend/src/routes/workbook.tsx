import { createFileRoute } from "@tanstack/react-router";

import Workbooks from "@/pages/workbook";

export const Route = createFileRoute("/workbook")({
  component: Workbooks,
});
