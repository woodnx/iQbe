import { fileURLToPath } from "node:url";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import server from "./allowed-server.json" with { type: "json" };
import { ApiError } from "./http/ApiError.js";
import type { AppEnv } from "./http/context.js";
import { errorHandler } from "./middleware/error.js";
import { authRateLimit } from "./middleware/authRateLimit.js";
import verifyAuthToken from "./middleware/verifyAuthToken.js";
import analysis from "./routes/analysis.js";
import auth from "./routes/auth.js";
import categories from "./routes/categories.js";
import csv from "./routes/csv.js";
import histories from "./routes/histories.js";
import i from "./routes/i.js";
import invite_code from "./routes/invite-code.js";
import levels from "./routes/levels.js";
import like from "./routes/like.js";
import mylists from "./routes/mylists.js";
import practice from "./routes/practice.js";
import quizzes from "./routes/quizzes.js";
import register from "./routes/register.js";
import request_reset_password from "./routes/request-reset-password.js";
import reset_password from "./routes/reset-password.js";
import tags from "./routes/tags.js";
import unlike from "./routes/unlike.js";
import unregister from "./routes/unregister.js";
import users from "./routes/users.js";
import workbooks from "./routes/workbooks.js";

export function createApp(
  options: {
    authenticate?: typeof verifyAuthToken;
    webRoot?: string;
    publicRoot?: string;
  } = {},
) {
  const app = new Hono<AppEnv>({ strict: false });
  const authenticate = options.authenticate ?? verifyAuthToken;

  app.onError(errorHandler);

  app.use("*", async (c, next) => {
    const response = await cors({ origin: server, credentials: true })(c, next);
    if (response instanceof Response)
      return new Response(response.body, {
        status: response.status === 204 ? 200 : response.status,
        headers: response.headers,
      });
  });
  app.use("/api/auth/*", authRateLimit());
  app.use(
    "/api/*",
    bodyLimit({
      maxSize: 5 * 1024 * 1024,
      onError: () => {
        throw new ApiError({
          title: "PAYLOAD_TOO_LARGE",
          type: "about:blank",
          status: 413,
          detail: "Request body exceeds 5 MiB.",
        });
      },
    }),
  );
  app.use("/api/*", async (c, next) => {
    if (c.req.path === "/api/auth" || c.req.path.startsWith("/api/auth/"))
      return next();
    return authenticate(c, next);
  });

  const api = app
    .route("/api/analysis", analysis)
    .route("/api/auth", auth)
    .route("/api/categories", categories)
    .route("/api/csv", csv)
    .route("/api/histories", histories)
    .route("/api/i", i)
    .route("/api/invite-code", invite_code)
    .route("/api/levels", levels)
    .route("/api/like", like)
    .route("/api/mylists", mylists)
    .route("/api/practice", practice)
    .route("/api/quizzes", quizzes)
    .route("/api/register", register)
    .route("/api/request-reset-password", request_reset_password)
    .route("/api/reset-password", reset_password)
    .route("/api/tags", tags)
    .route("/api/unlike", unlike)
    .route("/api/unregister", unregister)
    .route("/api/users", users)
    .route("/api/workbooks", workbooks);

  app.all("/api", () => {
    throw new ApiError().notFound();
  });
  app.all("/api/*", () => {
    throw new ApiError().notFound();
  });

  const publicRoot = options.publicRoot ?? `${process.cwd()}/public`;
  const webRoot =
    options.webRoot ?? fileURLToPath(new URL("./web", import.meta.url));

  app.use("*", serveStatic({ root: publicRoot }));
  app.use("*", serveStatic({ root: webRoot }));
  app.get("*", serveStatic({ root: webRoot, path: "index.html" }));

  return api;
}

export type AppType = ReturnType<typeof createApp>;
