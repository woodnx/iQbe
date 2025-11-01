import { createFileRoute } from "@tanstack/react-router";

import Practice from "@/pages/practice";

export const Route = createFileRoute("/practice")({
  component: Practice,
  validateSearch: (search: Record<string, unknown>) => ({
    path: typeof search.path === "string" ? search.path : undefined,
  }),
});
