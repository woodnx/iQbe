import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";

const router = new Hono<AppEnv>();
export default router;
