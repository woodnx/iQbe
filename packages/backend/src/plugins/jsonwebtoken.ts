import { randomUUID } from 'crypto';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';

/* 定数設定 */
const jwtSecret: Secret = process.env.JWT_SECRET || "";
const jwtOptions: SignOptions = {
  algorithm: 'HS256',
  expiresIn: process.env.ACCESS_TOKEN_DURATION_MINUTE + 'm'
};

interface User {
  uid: string,
  id?: number,
  nickname?: string,
  username: string,
}

const generateAccessToken = (user: User) => {
  const jwtPayload = {
    uid: user.uid,
  };

  return new Promise<string>((resolve, reject) => {
    try {
      const accessToken = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
      resolve(accessToken);
    } catch(e) {
      reject(e);
    }
  });
}

const generateRefreshToken = (user: User) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const refreshToken = randomUUID();
      resolve(refreshToken);
    } catch(e) {
      reject(e);
    }
  });
}

const verifyAccessToken = (token: string) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, jwtSecret, (error, user) => {
      if (error) reject(error);
      resolve(user);
    });
  });
}

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
}