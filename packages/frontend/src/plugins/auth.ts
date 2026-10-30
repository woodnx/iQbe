import { notifications } from "@mantine/notifications";
import type { InferResponseType } from "hono/client";
import store from "storejs";
import { ApiClientError, readResponse, rpc } from "@/utils/client";

export interface User {
  uid: string;
  username: string;
  nickname?: string;
}

type Session = InferResponseType<typeof rpc.api.auth.login.$post, 200>;
function saveSession({ accessToken, refreshToken, user }: Session) {
  localStorage.setItem("refreshToken", refreshToken);
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("uid", user.uid);
  store.set("loginedUser", { ...user, accessToken, refreshToken });
  return user;
}
export async function loginWithUsername(username: string, password: string) {
  try {
    return saveSession(
      await rpc.api.auth.login
        .$post({ json: { username, password } })
        .then(readResponse),
    );
  } catch (error) {
    if (
      error instanceof ApiClientError &&
      error.title === "REQUIRE_REREGISTRATION"
    )
      return "please do re-registration";
  }
}
export async function loginOldUser(
  username: string,
  email: string,
  password: string,
) {
  try {
    return saveSession(
      await rpc.api.auth.register
        .$post({ json: { username, email, password } })
        .then(readResponse),
    );
  } catch {
    return undefined;
  }
}
export async function signupUser(
  username: string,
  password: string,
  inviteCode?: string,
) {
  try {
    return saveSession(
      await rpc.api.auth.signup
        .$post({ json: { username, password, inviteCode } })
        .then(readResponse),
    );
  } catch {
    return undefined;
  }
}
export async function checkAuth() {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  const uid = localStorage.getItem("uid") || "";
  try {
    const { accessToken, user } = await rpc.api.auth.token
      .$post({ json: { refreshToken, uid } })
      .then(readResponse);
    localStorage.setItem("accessToken", accessToken);
    store.set("loginedUser", { ...user, accessToken, refreshToken });
    return user;
  } catch (error) {
    if (error instanceof ApiClientError && error.title === "NO_ANY_USERS")
      return "please-move-welcome-page";
  }
}
export async function getIdToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  const uid = localStorage.getItem("uid");
  if (!refreshToken || refreshToken === "undefined" || !uid) return undefined;
  try {
    const { accessToken, user } = await rpc.api.auth.token
      .$post({ json: { refreshToken, uid } })
      .then(readResponse);
    localStorage.setItem("accessToken", accessToken);
    store.set("loginedUser", { ...user, accessToken, refreshToken });
    return accessToken;
  } catch {
    return undefined;
  }
}
export async function logoutUser() {
  const uid = localStorage.getItem("uid");
  const refreshToken = localStorage.getItem("refreshToken");
  if (uid && refreshToken) {
    try {
      await rpc.api.auth.logout
        .$post({ json: { uid, refreshToken } })
        .then(readResponse);
    } catch {
      notifications.show({
        color: "red",
        message:
          "ログアウトできませんでした。接続を確認して再度お試しください。",
      });
      return;
    }
  }
  localStorage.setItem("refreshToken", "");
  localStorage.setItem("accessToken", "");
  localStorage.setItem("uid", "");
  store.remove("loginedUser");
  location.reload();
}
