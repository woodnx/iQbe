// import axios from "./axios";
import api from './api';

export interface User {
  uid: string,
  username: string,
  nickname?: string,
}

export async function loginWithUsername(username: string, password: string) {
  try {
    const data = await api.auth.login.$post({ body: {
      username,
      password
    }});

    const { accessToken, refreshToken, user } = data;
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('uid', user.uid);

    return user;
  } catch(e: any) {
    if (e?.title == "REQUIRE_REREGISTRATION") {
      return 'please do re-registration';
    }
  }
}

export async function loginOldUser(username: string, email: string, password: string) {
  try {
    const data = await api.auth.register.$post({ body: {
      username,
      email,
      password,
    }});

    const { accessToken, refreshToken, user } = data;
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('uid', user.uid);

    return user;
  } catch(e) {
    return;
  }
}

export async function signupUser(username: string, password: string, requiredInviteCode?: boolean, inviteCode?: string) {
  try{ 
    const data = await api.auth.signup.$post({ body: {
      username,
      password,
      inviteCode,
    }});
    const { accessToken, refreshToken, user } = data;
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('uid', user.uid);

    return user;
  } catch(e) {
    return;
  }
}

export async function checkAuth() {
  const refreshToken = localStorage.getItem('refreshToken');
  const uid = localStorage.getItem('uid');

  if (
    !refreshToken || 
    !uid || 
    refreshToken === 'undefined' || 
    uid === 'undefined' ||
    refreshToken == '' ||
    uid == ''
  ) {
    return undefined;
  }

  try {
    const data = await api.auth.token.$post({ body: {
      refreshToken,
      uid,
    }});

    const { accessToken, user } = data;
    localStorage.setItem('accessToken', accessToken);

    return user;
  } catch(e) {
    return;
  }
}

export async function getIdToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  const uid = localStorage.getItem('uid');

  if (!refreshToken || refreshToken == 'undefined' || !uid) {
    return undefined;
  }

  try {
    const data = await api.auth.token.$post({ body: {
      refreshToken,
      uid,
    }});

    const { accessToken } = data;
    localStorage.setItem('accessToken', accessToken);
    return accessToken;
  } catch(e) {
    return;
  }

  // return new Promise<string | undefined>((resolve, reject) => {
  //   const refreshToken = localStorage.getItem('refreshToken');
  //   const uid = localStorage.getItem('uid');
    
  //   if (!refreshToken || refreshToken == 'undefined' || !uid) {
  //     resolve(undefined);
  //     return;
  //   }
    
    
  //   axios.post<User>('/auth/token',  {
  //     refreshToken,
  //     uid,
  //   })
  //   .then(res => res.data)
  //   .then(data => { 
  //     // @ts-ignore
  //     const { accessToken, user } = data;
  //     localStorage.setItem('accessToken', accessToken);
  //     resolve(accessToken);
  //   })
  //   .catch(e => reject(e));
  // });
}

export function logoutUser() {
  localStorage.setItem('refreshToken', '');
  localStorage.setItem('accessToken', '');
  localStorage.setItem('uid', '');
  location.reload();
}