import type { User as ApiUser } from "@/utils/api-types";
import store from "storejs";

type User = ApiUser;

export const useAuth = () => {
  const setUser = (user: User, accessToken: string, refreshToken: string) => {
    store.set("loginedUser", {
      ...user,
      accessToken,
      refreshToken,
    });
  };

  const user: User = store.get("loginedUser");

  return { user, setUser };
};
