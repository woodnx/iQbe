import { createFileRoute } from "@tanstack/react-router";

import Create from "@/pages/create";

export const Route = createFileRoute("/create")({
  component: Create,
});
