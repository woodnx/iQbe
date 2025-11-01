import { createFileRoute } from "@tanstack/react-router";

import History from "@/pages/history";

export const Route = createFileRoute("/history")({
  component: History,
});
