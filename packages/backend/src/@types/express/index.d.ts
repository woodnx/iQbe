import type { Express } from "express";
import type { DecodedIdToken } from "firebase-admin/auth";

// declare module "express" {
//   interface Request {
//     user: DecodedIdToken
//   }
// }

declare module "express-serve-static-core" {
  interface Request {
    user: DecodedIdToken,
    userId: number
  }
}