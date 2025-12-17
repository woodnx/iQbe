import { client } from "@/utils/client";
import { AxiosError } from "axios";
import store from "storejs";

export interface User {
  uid: string;
  username: string;
  nickname?: string;
}

export async function loginWithUsername(username: string, password: string) {
  try {
    const { data } = await client.POST("/auth/login", {
      body: {
        username,
        password,
      },
    });

    if (!data) return undefined;

    const { accessToken, refreshToken, user } = data;

    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("uid", user.uid);
    store.set("loginedUser", {
      ...user,
      accessToken,
      refreshToken,
    });

    return user;
  } catch (e) {
    if (e instanceof AxiosError) {
      if (e?.response?.data.title == "REQUIRE_REREGISTRATION") {
        return "please do re-registration";
      }
    }
  }
}

export async function loginOldUser(
  username: string,
  email: string,
  password: string,
) {
  try {
    const { data } = await client.POST("/auth/register", {
      body: {
        username,
        email,
        password,
      },
    });

    if (!data) return undefined;

    const { accessToken, refreshToken, user } = data;

    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("uid", user.uid);
    store.set("loginedUser", {
      ...user,
      accessToken,
      refreshToken,
    });

    return user;
  } catch (e) {
    return;
  }
}

export async function signupUser(
  username: string,
  password: string,
  inviteCode?: string,
) {
  try {
    const { data } = await client.POST("/auth/signup", {
      body: {
        username,
        password,
        inviteCode,
      },
    });

    if (!data) return undefined;

    const { accessToken, refreshToken, user } = data;

    localStorage.setItem("refreshToken", refreshToken);
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("uid", user.uid);
    store.set("loginedUser", {
      ...user,
      accessToken,
      refreshToken,
    });

    return user;
  } catch (e) {
    return;
  }
}

export async function checkAuth() {
  const refreshToken = localStorage.getItem("refreshToken") || "";
  const uid = localStorage.getItem("uid") || "";

  try {
    const { data, error } = await client.POST("/auth/token", {
      body: {
        refreshToken,
        uid,
      },
    });

    if (error) throw error;
    if (!data) return undefined;

    const { accessToken, user } = data;
    localStorage.setItem("accessToken", accessToken);
    store.set("loginedUser", {
      ...user,
      accessToken,
      refreshToken,
    });

    return user;
  } catch (e) {
    // @ts-ignore
    if (e?.title == "NO_ANY_USERS") {
      return "please-move-welcome-page";
    }

    return;
  }
}

export async function getIdToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  const uid = localStorage.getItem("uid");

  if (!refreshToken || refreshToken == "undefined" || !uid) {
    return undefined;
  }

  try {
    const { data } = await client.POST("/auth/token", {
      body: {
        refreshToken,
        uid,
      },
    });

    if (!data) return undefined;

    const { accessToken, user } = data;
    localStorage.setItem("accessToken", accessToken);
    store.set("loginedUser", {
      ...user,
      accessToken,
      refreshToken,
    });

    return accessToken;
  } catch (e) {
    return;
  }
}

export function logoutUser() {
  localStorage.setItem("refreshToken", "");
  localStorage.setItem("accessToken", "");
  localStorage.setItem("uid", "");
  store.remove("loginedUser");
  location.reload();
}
