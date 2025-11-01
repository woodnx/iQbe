import { createFileRoute } from "@tanstack/react-router";

import Favorite from "@/pages/favorite";

export const Route = createFileRoute("/favorite")({
  component: Favorite,
});
