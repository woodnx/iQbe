import { StoreApi, UseBoundStore, create } from "zustand";
import { User, getAuth, getIdToken, onAuthStateChanged } from "firebase/auth"

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

    const auth = getAuth()
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const idToken = await getIdToken(user, true)
      set({ idToken })
    }) 
  },
}))

export default useUserStore