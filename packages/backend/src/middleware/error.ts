import express from 'express';
import { createError } from '@/plugins/createError';
import ApiError from '@/domains/ApiError';

export const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // エラー文をそのまま出力
  // クライアントには表示されない
  console.error(err);

  if (res.headersSent) return next(err);

  if (err instanceof ApiError) {
    return res.status(err.getSchema().status).send(err.getSchema());
  }
  
  return res.status(500).send(createError.internalProblems());
}