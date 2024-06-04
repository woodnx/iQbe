import express from 'express';
import { Send } from 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    userId: number,
    uid: string,
  }
}

export interface Response<ResBody> extends express.Response {
  json: Send<ResBody, this>
  jsonp: Send<ResBody, this>
  send: Send<ResBody, this>
}