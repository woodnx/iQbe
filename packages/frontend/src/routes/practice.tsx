import { createFileRoute } from "@tanstack/react-router";
import z from "zod";
import Practice from "@/pages/practice";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/practice")({
  component: Practice,
  validateSearch: quizSearchSchema.extend({
    isTransfer: z
      .union([z.string(), z.boolean()])
      .optional()
      .transform((v): boolean | undefined => {
        if (typeof v === "boolean") return v;
        if (v === "true") return true;
        if (v === "false") return false;
        return undefined;
      }),
  }),
});
