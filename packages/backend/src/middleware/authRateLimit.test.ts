import { Hono } from "hono";
import { authRateLimit } from "./authRateLimit.js";

it("limits requests before a handler, ignores spoofed forwarding headers, and resets", async () => {
  let time = 0;
  let calls = 0;
  const app = new Hono()
    .use("*", authRateLimit({ now: () => time, limit: 2, windowMs: 1000 }))
    .post("*", (c) => {
      calls++;
      return c.body(null, 204);
    });
  const request = (forwarded: string) =>
    app.request(
      "/api/auth/login",
      { method: "POST", headers: { "X-Forwarded-For": forwarded } },
      { incoming: { socket: { remoteAddress: "127.0.0.1" } } },
    );
  expect((await request("1.1.1.1")).status).toBe(204);
  expect((await request("2.2.2.2")).status).toBe(204);
  const denied = await request("3.3.3.3");
  expect(denied.status).toBe(429);
  expect(denied.headers.get("Retry-After")).toBe("1");
  expect(calls).toBe(2);
  time = 1000;
  expect((await request("1.1.1.1")).status).toBe(204);
});
it("caps total authentication work across different addresses", async () => {
  const app = new Hono()
    .use("*", authRateLimit({ globalLimit: 2 }))
    .post("*", (c) => c.body(null, 204));
  const request = (ip: string) =>
    app.request(
      "/api/auth/signup",
      { method: "POST" },
      { incoming: { socket: { remoteAddress: ip } } },
    );
  expect((await request("1")).status).toBe(204);
  expect((await request("2")).status).toBe(204);
  expect((await request("3")).status).toBe(429);
});
