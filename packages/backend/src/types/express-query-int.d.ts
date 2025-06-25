declare module "express-query-int" {
  import { Request, Response, NextFunction } from "express";

  export default function parseInt(): (
    req: Request,
    res: Response,
    next: NextFunction,
  ) => void;
}
