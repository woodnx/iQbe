import { components } from "api/schema";
import store from "storejs";

type User = components["schemas"]["User"];

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
