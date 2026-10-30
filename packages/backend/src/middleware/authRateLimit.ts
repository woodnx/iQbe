import { getConnInfo } from "@hono/node-server/conninfo";
import { createMiddleware } from "hono/factory";
import type { AppEnv } from "@/http/context.js";

// Process-local fixed windows. Never trust client-supplied forwarding headers.
export function authRateLimit(
  options: {
    now?: () => number;
    limit?: number;
    globalLimit?: number;
    windowMs?: number;
  } = {},
) {
  const now = options.now ?? Date.now;
  const windowMs = options.windowMs ?? 60_000;
  const buckets = new Map<string, { count: number; reset: number }>();
  let global = { count: 0, reset: 0 };
  return createMiddleware<AppEnv>(async (c, next) => {
    if (c.req.method !== "POST") return next();
    const time = now();
    if (time >= global.reset) {
      global = { count: 0, reset: time + windowMs };
      for (const [key, bucket] of buckets) {
        if (time >= bucket.reset) buckets.delete(key);
      }
    }
    let address = "unknown";
    try {
      address = getConnInfo(c).remote.address ?? address;
    } catch {
      /* In-process requests have no socket. */
    }
    const group = /\/(token|logout)\/?$/.test(c.req.path)
      ? "session"
      : "credential";
    const key = `${address}:${group}`;
    const limit = options.limit ?? (group === "session" ? 120 : 20);
    let bucket = buckets.get(key);
    if (!bucket || time >= bucket.reset) {
      bucket = { count: 0, reset: time + windowMs };
    }
    const globalLimit = options.globalLimit ?? 600;
    if (global.count >= globalLimit || bucket.count >= limit) {
      const reset = global.count >= globalLimit ? global.reset : bucket.reset;
      c.header(
        "Retry-After",
        String(Math.max(1, Math.ceil((reset - time) / 1000))),
      );
      c.header("Cache-Control", "no-store");
      return c.json(
        {
          title: "TOO_MANY_REQUESTS",
          type: "about:blank",
          status: 429,
          detail: "Too many authentication attempts. Please retry later.",
        },
        429,
      );
    }
    global.count++;
    bucket.count++;
    buckets.set(key, bucket);
    return next();
  });
}
