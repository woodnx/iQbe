import { createFileRoute } from "@tanstack/react-router";

import Setting from "@/pages/setting";

export const Route = createFileRoute("/setting")({
  component: Setting,
});
