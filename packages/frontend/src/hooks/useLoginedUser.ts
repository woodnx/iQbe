import store from 'storejs';
import { components } from 'api/schema';

type AccessToken = { accessToken: string };
type RefreshToken = { refreshToken: string };
type User = components['schemas']['User'] & AccessToken & RefreshToken;

export const useLoginedUser = () => {
  const data: User = store.get('loginedUser');

  return {
    i: data,
  }
}

export const useIsSuperUser = () => {
  const data: User = store.get('loginedUser');

  return data?.permission == "SUPER_USER"
}
