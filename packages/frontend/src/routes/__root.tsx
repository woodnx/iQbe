import { createRootRoute } from "@tanstack/react-router";

import Layout from "@/layouts";
import Error from "@/pages/error";

export const Route = createRootRoute({
  component: Layout,
  notFoundComponent: Error,
});
