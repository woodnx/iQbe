import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";
import type { z } from "zod";
import { ApiError } from "./ApiError.js";

export const validate = <
  T extends keyof ValidationTargets,
  S extends z.ZodType,
>(
  target: T,
  schema: S,
) =>
  zValidator(target, schema, (result) => {
    if (!result.success)
      throw new ApiError().invalidParams(result.error.message);
  });
