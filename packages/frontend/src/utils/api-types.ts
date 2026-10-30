import type { InferRequestType, InferResponseType } from "hono/client";
import type { rpc } from "./client";
export type Quiz = InferResponseType<typeof rpc.api.quizzes.$get, 200>[number];
export type Workbook = InferResponseType<
  typeof rpc.api.workbooks.$get,
  200
>[number];
export type Mylist = NonNullable<Quiz["registerdMylist"]>[number];
export type Category = InferResponseType<
  typeof rpc.api.categories.$get,
  200
>[number];
export type SubCategory = NonNullable<Category["sub"]>[number];
export type User = InferResponseType<typeof rpc.api.i.$get, 200>;
export type QuizQuery = NonNullable<
  InferRequestType<typeof rpc.api.quizzes.$get>["query"]
>;
export type QuizInput = InferRequestType<typeof rpc.api.quizzes.$post>["json"];
