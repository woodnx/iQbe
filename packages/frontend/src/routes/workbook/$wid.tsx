import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import WorkbookDetail from "@/pages/workbook-detail";
import { quizSearchSchema } from "../_schemas/quizSearch";

export const Route = createFileRoute("/workbook/$wid")({
  params: z.object({
    wid: z.string(),
  }),
  validateSearch: quizSearchSchema,
  component: WorkbookDetail,
});
