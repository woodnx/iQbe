import type { AppType } from "backend/rpc";
import { hc } from "hono/client";
import store from "storejs";

const tokenClient = hc<AppType>("/");
let pendingRefresh: Promise<string | undefined> | undefined;

async function refreshAccessToken(): Promise<string | undefined> {
  const uid = localStorage.getItem("uid");
  const refreshToken = localStorage.getItem("refreshToken");
  if (!uid || !refreshToken) return;
  try {
    const response = await tokenClient.api.auth.token.$post({
      json: { uid, refreshToken },
    });
    if (!response.ok) return;
    const { accessToken, user } = await response.json();
    localStorage.setItem("accessToken", accessToken);
    store.set("loginedUser", { ...user, accessToken, refreshToken });
    return accessToken;
  } catch {
    return undefined;
  }
}

// A rejected expired token has not reached a handler, so it is safe to replay once.
export const authenticatedFetch: typeof fetch = async (input, init) => {
  const replay = input instanceof Request ? input.clone() : input;
  const response = await fetch(input, init);
  if (response.status !== 401) return response;
  const problem = await response
    .clone()
    .json()
    .catch(() => undefined);
  if (problem?.title !== "EXPIRED_TOKEN") return response;
  const url = input instanceof Request ? input.url : String(input);
  if (/\/api\/auth(?:\/|$)/.test(url)) return response;

  const headers = new Headers(
    init?.headers ?? (input instanceof Request ? input.headers : undefined),
  );
  const current = localStorage.getItem("accessToken");
  let token =
    current && current !== headers.get("Authorization") ? current : undefined;
  if (!token) {
    pendingRefresh ??= refreshAccessToken().finally(() => {
      pendingRefresh = undefined;
    });
    token = await pendingRefresh;
  }
  if (!token) return response;
  headers.set("Authorization", token);
  return fetch(replay, { ...init, headers });
};
