import type { User as ApiUser } from "@/utils/api-types";
import store from "storejs";

type AccessToken = { accessToken: string };
type RefreshToken = { refreshToken: string };
type User = ApiUser & AccessToken & RefreshToken;

export const useLoginedUser = () => {
  const data: User = store.get("loginedUser");

  return {
    i: data,
  };
};

export const useIsSuperUser = () => {
  const data: User = store.get("loginedUser");

  return data?.permission == "SUPER_USER";
};
