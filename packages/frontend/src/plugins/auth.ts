import { api } from "@/utils/api";
import { ApiClientError } from "@/utils/client";
import store from "storejs";

export interface User {
  uid: string;
  username: string;
  nickname?: string;
}

type Session = Awaited<ReturnType<typeof api.postAuthLogin>>;
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
      await api.postAuthLogin({ body: { username, password } }),
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
      await api.postAuthRegister({ body: { username, email, password } }),
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
      await api.postAuthSignup({ body: { username, password, inviteCode } }),
    );
  } catch {
    return undefined;
  }
}
export async function checkAuth() {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  const uid = localStorage.getItem("uid") || "";
  try {
    const { accessToken, user } = await api.postAuthToken({
      body: { refreshToken, uid },
    });
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
    const { accessToken, user } = await api.postAuthToken({
      body: { refreshToken, uid },
    });
    localStorage.setItem("accessToken", accessToken);
    store.set("loginedUser", { ...user, accessToken, refreshToken });
    return accessToken;
  } catch {
    return undefined;
  }
}
export function logoutUser() {
  localStorage.setItem("refreshToken", "");
  localStorage.setItem("accessToken", "");
  localStorage.setItem("uid", "");
  store.remove("loginedUser");
  location.reload();
}
