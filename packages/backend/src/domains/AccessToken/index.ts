import jwt, { Secret, SignOptions } from "jsonwebtoken";

import ValueObject from "../shared/ValueObject";

interface AccessTokenValue {
  uid: string;
  username: string;
}

const jwtSecret: Secret = process.env.JWT_SECRET_KEY || "";
const jwtOptions: SignOptions = {
  algorithm: "HS256",
  expiresIn: process.env.ACCESS_TOKEN_DURATION_MINUTE + "m",
};

export default class AccessToken extends ValueObject<
  AccessTokenValue,
  "AccessToken"
> {
  constructor(value: AccessTokenValue) {
    super(value);
  }

  public toToken(): string {
    const jwtPayload = {
      uid: this._value.uid,
      username: this._value.username,
    };

    return jwt.sign(jwtPayload, jwtSecret, jwtOptions);
  }

  protected validate(value: AccessTokenValue): void {}
}
