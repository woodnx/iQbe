import axios from "./plugins/axios";

export const fetcher = (url: string, params?: any) => axios.get(url, { params }).then(res => res.data);