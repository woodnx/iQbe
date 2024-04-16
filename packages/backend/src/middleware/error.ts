import express from 'express';
import { createError } from '@/plugins/createError';

export const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  // エラー文をそのまま出力
  // クライアントには表示されない
  console.error(err);

  if (res.headersSent) return next(err);
  if (!err.status) // カスタムのエラーオブジェクトではない場合
    return res.status(500).send(createError.internalProblems());
  
  return res.status(err.status).send(err);
}