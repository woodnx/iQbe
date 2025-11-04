import { createFileRoute } from "@tanstack/react-router";
import Favorite from "@/pages/favorite";
import { quizSearchSchema } from "./_schemas/quizSearch";

export const Route = createFileRoute("/favorite")({
  validateSearch: quizSearchSchema.transform((value) => ({
    ...value,
    isFavorite: true,
  })),
  component: Favorite,
});
