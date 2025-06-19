import { components } from "api/schema";
import { randomUUID } from "crypto";
import jwt, { Secret, SignOptions } from "jsonwebtoken";

type User = components["schemas"]["User"];

/* 定数設定 */
const jwtSecret: Secret = process.env.JWT_SECRET_KEY || "";
const jwtOptions: SignOptions = {
  algorithm: "HS256",
  expiresIn: process.env.ACCESS_TOKEN_DURATION_MINUTE + "m",
};

interface VerifyedToken {
  uid: string;
  iat: number;
  exp: number;
}

const generateAccessToken = ({ uid, username }: User) => {
  const jwtPayload = {
    uid,
  };

  return jwt.sign(jwtPayload, jwtSecret, jwtOptions);
};

const generateRefreshToken = () => {
  return randomUUID();
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
