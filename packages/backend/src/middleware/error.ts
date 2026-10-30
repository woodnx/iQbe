import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ApiError } from "@/http/ApiError.js";
import type { AppEnv } from "@/http/context.js";

export const errorHandler: ErrorHandler<AppEnv> = (err, c) => {
  if (err instanceof ApiError)
    return c.json(err.schema, err.status as ContentfulStatusCode);
  if (err instanceof HTTPException && err.status < 500) {
    const error = new ApiError().invalidParams(err.message).schema;
    return c.json({ ...error, status: err.status }, err.status);
  }
  console.error(err);
  const error = new ApiError().internalProblems();
  return c.json(error.schema, 500);
};
