import { z } from "zod";

// Accept the HTTP representation without treating the string "false" as truthy.
// RPC callers supply numbers; HTTP query strings are parsed at the boundary.
export const queryNumber = z.preprocess(
  (value: unknown) =>
    typeof value === "string" &&
    /^-?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value)
      ? Number(value)
      : value,
  z.number(),
) as z.ZodType<number, number>;

export const queryBoolean = z.preprocess(
  (value: unknown) =>
    value === "true" ? true : value === "false" ? false : value,
  z.boolean(),
) as z.ZodType<boolean, boolean>;

export const positiveId = queryNumber.pipe(z.number().int().positive().safe());

const timestamp = queryNumber.pipe(
  z.number().int().min(-8640000000000000).max(8640000000000000),
);

// Legacy millisecond timestamps remain readable for saved links and older clients.
export const dateTimestamp = z
  .preprocess(
    (value: unknown) => {
      const legacy = timestamp.safeParse(value);
      return legacy.success ? new Date(legacy.data).toISOString() : value;
    },
    z.union([z.iso.date(), z.iso.datetime({ offset: true })]),
  )
  .transform((value) => new Date(value).getTime()) as z.ZodType<number, string>;

export const validRange = (value: {
  since?: number | null;
  until?: number | null;
}) => value.since == null || value.until == null || value.since <= value.until;
