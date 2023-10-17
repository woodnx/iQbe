import _axios, { AxiosError } from "axios";
import useUserStore from "../store/user";

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
  const idToken = useUserStore.getState().idToken;
  
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
    useUserStore.getState().setIdToken();
  }

  return Promise.reject(error);
});

export default axios;