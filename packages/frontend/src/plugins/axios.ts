import _axios, { AxiosError } from "axios";
import { getIdToken } from "./auth";

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
(error: AxiosError) => {
  // @ts-ignore
  if (error.response?.data.message === 'invalid authorization'){
    getIdToken().then(token => {
      localStorage.setItem('accessToken', token || "");
    });
  }

  return Promise.reject(error);
});

export default axios;