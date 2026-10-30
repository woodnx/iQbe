import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  post: vi.fn(),
  notify: vi.fn(),
  remove: vi.fn(),
  reload: vi.fn(),
}));
vi.mock("@/utils/client", () => ({
  rpc: { api: { auth: { logout: { $post: mocks.post } } } },
  readResponse: async (response: Response) => {
    if (!response.ok) throw new Error("HTTP error");
  },
  ApiClientError: class extends Error {},
}));
vi.mock("@mantine/notifications", () => ({
  notifications: { show: mocks.notify },
}));
vi.mock("storejs", () => ({ default: { remove: mocks.remove } }));

import { logoutUser } from "./auth";

let storage: Map<string, string>;
beforeEach(() => {
  vi.clearAllMocks();
  storage = new Map([
    ["uid", "user"],
    ["refreshToken", "token"],
    ["accessToken", "access"],
  ]);
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  vi.stubGlobal("location", { reload: mocks.reload });
});
it("waits for server revocation before clearing the session", async () => {
  let finish!: (response: Response) => void;
  mocks.post.mockReturnValue(
    new Promise<Response>((resolve) => {
      finish = resolve;
    }),
  );
  const pending = logoutUser();
  expect(storage.get("refreshToken")).toBe("token");
  expect(mocks.reload).not.toHaveBeenCalled();
  finish(new Response(null, { status: 204 }));
  await pending;
  expect(mocks.post).toHaveBeenCalledWith({
    json: { uid: "user", refreshToken: "token" },
  });
  expect(storage.get("refreshToken")).toBe("");
  expect(mocks.reload).toHaveBeenCalledOnce();
});
it("keeps the session and reports a failed logout so it can be retried", async () => {
  mocks.post.mockRejectedValue(new Error("offline"));
  await logoutUser();
  expect(storage.get("refreshToken")).toBe("token");
  expect(mocks.notify).toHaveBeenCalledOnce();
  expect(mocks.reload).not.toHaveBeenCalled();
});
