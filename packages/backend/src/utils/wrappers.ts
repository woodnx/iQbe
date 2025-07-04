import express from "express";
import { Response } from "@/types/global";
import {
  ApiBody,
  ApiPath,
  ApiPathParam,
  ApiQueryParam,
  ApiResponse,
  HttpMethod,
} from "@/utils/schema";

type Handler<T = express.Request, U = express.Response> = (
  req: T,
  res: U,
  next: express.NextFunction,
) => Promise<void>;

export const asyncWrapper = <T = express.Request, U = express.Response>(
  handler: Handler<T, U>,
) => {
  return (req: T, res: U, next: express.NextFunction) => {
    handler(req, res, next).catch(next);
  };
};

export const typedWrapper =
  <Path extends ApiPath, Method extends HttpMethod>(
    handler: (
      req: express.Request<
        ApiPathParam<Path, Method>,
        any,
        ApiBody<Path, Method>,
        ApiQueryParam<Path, Method>
      >,
      res: Response<ApiResponse<Path, Method>>,
      next: express.NextFunction,
    ) => void,
  ) =>
  (
    req: express.Request<
      ApiQueryParam<Path, Method>,
      any,
      ApiBody<Path, Method>,
      ApiPathParam<Path, Method>
    >,
    res: express.Response,
    next: express.NextFunction,
  ) =>
    handler(req, res, next);

export const typedAsyncWrapper = <
  Path extends ApiPath,
  Method extends HttpMethod,
>(
  handler: (
    req: express.Request<
      ApiPathParam<Path, Method>,
      any,
      ApiBody<Path, Method>,
      ApiQueryParam<Path, Method>
    >,
    res: Response<ApiResponse<Path, Method>>,
    next: express.NextFunction,
  ) => Promise<any>,
) => asyncWrapper(handler);
