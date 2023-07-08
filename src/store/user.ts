import { StoreApi, UseBoundStore, create } from "zustand";
import { User, getIdToken, onAuthStateChanged } from "firebase/auth"
import { auth } from "../plugins/firebase";

export type FirebaseUser = User | null
export type UserIdToken = string | null
export type UserState = {
  nickname: string,
  photoUrl: string,
  idToken: string,
  setIdToken: (token?: string) => void
}

const useUserStore: UseBoundStore<StoreApi<UserState>> = create<UserState>((set) => ({
  nickname: '',
  photoUrl: '',
  idToken: '',
  setIdToken: (token?: string) => {
    if (!!token) set({ idToken: token })

    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const idToken = await getIdToken(user, true)
      set({ idToken })
    }) 
  },
}))

export default useUserStore