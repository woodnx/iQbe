import express from 'express';
import { Send } from 'express-serve-static-core';

type AuthUser = {
  userId: number,
  uid: string,
  username: string,
  permission: string,
  iat: number,
  exp: number,
}

declare module 'express-serve-static-core' {
  interface Request {
    user: AuthUser,
  }
}

export interface Response<ResBody> extends express.Response {
  json: Send<ResBody, this>
  jsonp: Send<ResBody, this>
  send: Send<ResBody, this>
}