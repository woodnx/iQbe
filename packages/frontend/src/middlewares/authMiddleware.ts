import type { Middleware } from "openapi-fetch";

export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    //リクエスト前に毎回idTokenを取得する
    const idToken = localStorage.getItem("accessToken");

    request.headers.set("Authorization", `${idToken}`);
    return request;
  },
};
