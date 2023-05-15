import { initializeApp } from 'firebase/app'
import { getAuth } from "firebase/auth"
import firebaseConfig from './firebase.config'

// Firebaseを初期化
const app = initializeApp(firebaseConfig)

// Firebase Authenticationを初期化してサービスへのリファレンスを取得
const auth = getAuth(app)

export { auth }