import { randomUUID } from "crypto";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

/* 定数設定 */
const jwtSecret: Secret = process.env.JWT_SECRET_KEY || "";
const jwtOptions: SignOptions = {
  algorithm: "HS256",
  expiresIn: process.env.ACCESS_TOKEN_DURATION_MINUTE + "m",
};

interface User {
  uid: string;
  id?: number;
  nickname?: string;
  username: string;
}

interface VerifyedToken {
  uid: string;
  iat: number;
  exp: number;
}

const generateAccessToken = ({ uid, username }: User) => {
  const jwtPayload = {
    uid,
  };

  return new Promise<string>((resolve, reject) => {
    try {
      const accessToken = jwt.sign(jwtPayload, jwtSecret, jwtOptions);
      resolve(accessToken);
    } catch (e) {
      reject(e);
    }
  });
};

const generateRefreshToken = (user: User) => {
  return new Promise<string>((resolve, reject) => {
    try {
      const refreshToken = randomUUID();
      resolve(refreshToken);
    } catch (e) {
      reject(e);
    }
  });
};

const verifyAccessToken = (token: string) => {
  return new Promise<VerifyedToken>((resolve, reject) => {
    jwt.verify(token, jwtSecret, (error, user) => {
      if (error || !user) {
        const noUser = new Error("TokenVerifyError: no user");
        reject(error || noUser);
      }
      resolve(JSON.parse(JSON.stringify(user)));
    });
  });
};

export { generateAccessToken, generateRefreshToken, verifyAccessToken };
