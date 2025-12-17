import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import Mylist from "@/pages/mylists";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/mylist/$mid")({
  params: z.object({
    mid: z.string(),
  }),
  validateSearch: quizSearchSchema,
  component: Mylist,
});
