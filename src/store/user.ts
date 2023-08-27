import { StoreApi, UseBoundStore, create } from "zustand";
import { User, getIdToken } from "firebase/auth"
import { auth, checkFirebaseAuth } from "../plugins/firebase";

export type FirebaseUser = User | null;
export type UserIdToken = string | null;
export type UserState = {
  nickname: string,
  photoUrl: string,
  idToken: string | null,
  setIdToken: () => void
};

const useUserStore: UseBoundStore<StoreApi<UserState>> = create<UserState>((set) => ({
  nickname: '',
  photoUrl: '',
  idToken: null,
  setIdToken: async () => {
    const user = await checkFirebaseAuth(auth);
    if (!user) { 
      set({ idToken: null });
      return;
    }

    const idToken = await getIdToken(user, true);
    set({ idToken });
  },
}));

export default useUserStore;