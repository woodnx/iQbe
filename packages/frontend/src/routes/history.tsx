import { createFileRoute } from "@tanstack/react-router";
import History from "@/pages/history";
import dayjs from "@/plugins/dayjs";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/history")({
  validateSearch: quizSearchSchema.transform((value) => {
    const since =
      typeof value.since === "number" && !Number.isNaN(value.since)
        ? value.since
        : dayjs().startOf("day").valueOf();
    const until =
      typeof value.until === "number" && !Number.isNaN(value.until)
        ? value.until
        : dayjs().endOf("day").valueOf();
    return {
      ...value,
      since,
      until,
    };
  }),
  component: History,
});
