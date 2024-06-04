import _axios, { AxiosError } from "axios";
import { getIdToken } from "./auth";
import { Error } from "api/types";

const axios = _axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    "Access-Control-Allow-Origin": "*",
  },
  responseType: 'json',
});

axios.interceptors.request.use(async (request) => {
  //リクエスト前に毎回idTokenを取得する
  const idToken = localStorage.getItem('accessToken');
  
  request.headers.Authorization = idToken;
  
  return request;
},
(error) => {
  // リクエスト エラーの処理
  return Promise.reject(error);
});

axios.interceptors.response.use((responce) => {
  return responce;
},
(error: AxiosError<Error>) => {
  if (error.response?.data.title === 'EXPIRED_TOKEN'){
    getIdToken().then(token => {
      localStorage.setItem('accessToken', token || "");
    });
  }

  // @ts-ignore
  if (error.response?.data === 'no token' || error.response?.data === 'invalid token') {
    localStorage.setItem('accessToken', "");
    localStorage.setItem('refreshToken', "");
    localStorage.setItem('uid', "");
  }

  return Promise.reject(error);
});

export default axios;