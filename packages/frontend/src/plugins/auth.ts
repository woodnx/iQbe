import axios from "./axios"

export interface User {
  uid: string,
  username: string,
  nickname?: string,
}

export function loginWithUsername(username: string, password: string) {
  return new Promise<User>((resolve, reject) => {
    axios.post('/auth/login', {
      username,
      password
    })
    .then(res => res.data)
    .then(({ accessToken, refreshToken, user }) => {
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('uid', user.uid);

      resolve(user);
    })
    .catch((e) => reject(e));
  });
}

export function loginWithEmail(username: string, email: string, password: string) {
  return new Promise<User>((resolve, reject) => {
    axios.post('/auth/old', {
      email,
      username,
      password,
    })
    .then(res => res.data)
    .then(({ accessToken, refreshToken, user }) => {
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('uid', user.uid);

      resolve(user);
    })
    .catch((e) => reject(e));
  });
}

export function signupUser(username: string, password: string) {
  return new Promise<User>((resolve, reject) => {
    axios.post('/auth/signup', {
      username,
      password,
    })
    .then(res => res.data)
    .then(({ accessToken, refreshToken, user }) => {
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('uid', user.uid);

      resolve(user);
    })
    .catch((e) => reject(e));
  });
}

export function checkAuth() {
  return new Promise<User | undefined>((resolve, reject) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const uid = localStorage.getItem('uid');
    
    if (!refreshToken || refreshToken == 'undefined' || !uid) {
      resolve(undefined);
      return;
    }

    axios.post<User>('/auth/token',  {
      refresh_token: refreshToken,
      id: uid,
    })
    .then(res => res.data)
    .then(data => { 
      // @ts-ignore
      const { accessToken, user } = data;
      localStorage.setItem('accessToken', accessToken);

      resolve(user);
    })
    .catch(e => reject(e));
  });
}

export function getIdToken() {
  return new Promise<string | undefined>((resolve, reject) => {
    const refreshToken = localStorage.getItem('refreshToken');
    const uid = localStorage.getItem('uid');
    
    if (!refreshToken || refreshToken == 'undefined' || !uid) {
      resolve(undefined);
      return;
    }
    
    axios.post<User>('/auth/token',  {
      refresh_token: refreshToken,
      id: uid,
    })
    .then(res => res.data)
    .then(data => { 
      // @ts-ignore
      const { accessToken, user } = data;
      localStorage.setItem('accessToken', accessToken);
      resolve(accessToken);
    })
    .catch(e => reject(e));
  });
}