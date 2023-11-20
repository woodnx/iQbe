import { StoreApi, UseBoundStore, create } from "zustand";
import { User, getIdToken } from "firebase/auth"
import { auth, checkFirebaseAuth } from "../plugins/firebase";
import { UserData } from "../types";

export type FirebaseUser = User | null;
export type UserIdToken = string | null;
export type UserState = {
  userId: number,
  nickname: string,
  photoUrl: string,
  idToken: string | null,
  setIdToken: () => void,
  setUserData: ({
    uid, 
    username
  }: UserData) => void,
};

const useUserStore: UseBoundStore<StoreApi<UserState>> = create<UserState>((set) => ({
  userId: 0,
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
  setUserData: ({
    uid,
    username
  }) => {
    set({ userId: id, nickname });
  }
}));

export default useUserStore;