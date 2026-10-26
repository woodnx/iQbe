import type { ErrorSchemaDTO } from "backend/dto";
import type { AppType } from "backend/rpc";
import type { ClientResponse } from "hono/client";
import { hc } from "hono/client";
import { authenticatedFetch } from "./auth-fetch";

export type ApiProblem = ErrorSchemaDTO;

export class ApiClientError extends Error implements ApiProblem {
  constructor(public readonly problem: ApiProblem) {
    super(problem.detail);
  }
  get title() {
    return this.problem.title;
  }
  get type() {
    return this.problem.type;
  }
  get status() {
    return this.problem.status;
  }
  get detail() {
    return this.problem.detail;
  }
}

export const rpc = hc<AppType>("/", {
  fetch: authenticatedFetch,
  headers: (): Record<string, string> => {
    const token = localStorage.getItem("accessToken");
    return token ? { Authorization: token } : {};
  },
});

type ResponseData<R> = R extends ClientResponse<infer T, number, string>
  ? T extends null
    ? undefined
    : T
  : never;

export async function readResponse<
  R extends ClientResponse<unknown, number, string>,
>(response: R): Promise<ResponseData<R>> {
  const text = await response.text();
  const contentType = response.headers.get("content-type") ?? "";
  let data: unknown = text;
  if (text && contentType.includes("application/json")) data = JSON.parse(text);
  if (!response.ok) {
    const problem =
      typeof data === "object" && data !== null && "title" in data
        ? (data as ApiProblem)
        : {
            title: "HTTP_ERROR",
            type: "about:blank",
            status: response.status,
            detail: text || response.statusText,
          };
    throw new ApiClientError(problem);
  }
  return (text ? data : undefined) as ResponseData<R>;
}
