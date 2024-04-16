import { Error } from "api/types"

export const createError = {
  invalidParams: (detail?: string): Error => {
    console.trace();
    return {
      title: "INVAILD_PARAMS",
      type: "about:blank",
      status: 400,
      detail: detail || "This request contains invaild parameter. Please correct to the right ones.",
    }
  },
  noUser: (detail?: string): Error => {
    console.trace();
    return {
      title: "NO_USER",
      type: "about:blank",
      status: 400,
      detail: detail || "No user with such a user name and password."
    }
  },
  expiredToken: (detail?: string): Error => {
    console.trace();
    return {
      title: "EXPIRED_TOKEN",
      type: "about:blank",
      status: 401,
      detail: detail || "This authorization token have expired. Please refetch token.",
    }
  },
  invalidToken: (detail?: string): Error => {
    console.trace();
    return {
      title: "INVAILD_TOKEN",
      type: "about:blank",
      status: 401,
      detail: detail || "This authorization token is invalid.",
    }
  },
  noToken: (detail?: string): Error => {
    console.trace();
    return {
      title: "NO_TOKEN",
      type: "about:blank",
      status: 401,
      detail: detail || "Authorization token was not found. Please set authorization header.",
    }
  },
  accessDenied: (detail?: string): Error => {
    console.trace();
    return {
      title: "ACCESS_DENIED",
      type: "about:blank",
      status: 403,
      detail: detail || "Access denied. Insufficient rights to access the resource.",
    }
  },
  internalProblems: (): Error => {
    console.trace();
    return {
      title: "INTERNAL_PROBLEMS",
      type: "about:blank",
      status: 500,
      detail: "Something problems occured in server.",
    }
  },
  create: (error: Error): Error => {
    console.trace();
    return error
  },
}