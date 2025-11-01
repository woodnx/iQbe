import { createFileRoute } from "@tanstack/react-router";

import Welcome from "@/pages/welcome";

export const Route = createFileRoute("/welcome")({
  component: Welcome,
});
