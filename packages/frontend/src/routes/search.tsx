import { createFileRoute } from "@tanstack/react-router";
import Search from "@/pages/search";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/search")({
  validateSearch: quizSearchSchema,
  component: Search,
});
