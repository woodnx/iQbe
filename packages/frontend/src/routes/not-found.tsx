import { createFileRoute } from "@tanstack/react-router";

import Error from "@/pages/error";

export const Route = createFileRoute("/not-found")({
  component: Error,
});
