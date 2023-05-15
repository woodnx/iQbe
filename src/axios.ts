import _axios from "axios"
import { getAuth, getIdToken, onAuthStateChanged } from "firebase/auth"

const axios = _axios.create({
  baseURL: 'http://localhost:9000/v2',
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    // 'Authorization': `Bearer ${idToken}`,
  },
  responseType: 'json',
})

axios.interceptors.request.use(async (request) => {
  //リクエスト前に毎回idTokenを取得する
  const auth = getAuth()
  await onAuthStateChanged(auth, async (user) => { 
    if (!user) return;

    const idToken = await getIdToken(user, true)

    if (!idToken) return;

    request.headers.Authorization = idToken
  })  
  return request
},(error) => {
  // リクエスト エラーの処理
  return Promise.reject(error);
})

export default axios