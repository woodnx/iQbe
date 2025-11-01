import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import Mylist from "@/pages/mylists";

export const Route = createFileRoute("/mylist/$mid")({
  params: z.object({
    mid: z.string(),
  }),
  component: Mylist,
});
