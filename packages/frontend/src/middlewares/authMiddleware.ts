import { getIdToken } from "@/plugins/auth";
import  type { Middleware } from "openapi-fetch";

export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    //リクエスト前に毎回idTokenを取得する
    const idToken = localStorage.getItem('accessToken');
    
    request.headers.set("Authorization", `${idToken}`);
    return request;
  },

  async onResponse({ response }) {
    if (response.status >= 400) {
      // @ts-ignore
      if (response?.data.title === 'EXPIRED_TOKEN'){
        getIdToken().then(token => {
          localStorage.setItem('accessToken', token || "");
        });
      }
    
      // @ts-ignore
      if (response?.data === 'no token' || response?.data === 'invalid token') {
        localStorage.setItem('accessToken', "");
        localStorage.setItem('refreshToken', "");
        localStorage.setItem('uid', "");
      }
    
      return Promise.reject(response);
    }
  }
};