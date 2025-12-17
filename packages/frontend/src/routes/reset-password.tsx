import { createFileRoute } from "@tanstack/react-router";

import ResetPassword from "@/pages/reset-password";

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  validateSearch: (search: Record<string, unknown>) => ({
    token: typeof search.token === "string" ? search.token : undefined,
  }),
});
