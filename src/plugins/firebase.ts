import { initializeApp } from 'firebase/app'
import { Auth, User, getAuth, onAuthStateChanged } from "firebase/auth"
import firebaseConfig from './firebase.config'

// Firebaseを初期化
const app = initializeApp(firebaseConfig)

// Firebase Authenticationを初期化してサービスへのリファレンスを取得
const auth = getAuth(app)

const checkFirebaseAuth = (auth: Auth) => (
  new Promise<User | null>((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user)
    })
  })
)

export { auth, checkFirebaseAuth }