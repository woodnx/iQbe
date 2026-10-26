import type { InferRequestType } from "hono/client";
import { ApiClientError, readResponse, rpc } from "./client";

const cleanQuery = <T extends object>(query: T): T =>
  Object.fromEntries(
    Object.entries(query).filter(
      ([, value]) =>
        value != null && !(typeof value === "number" && Number.isNaN(value)),
    ),
  ) as T;

export async function getWorkbooksAll(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["workbooks"]["all"].$get({}, { init: { signal } }),
  );
}

export async function getLevels(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(await rpc.api["levels"].$get({}, { init: { signal } }));
}

export async function postRequestResetPassword(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["request-reset-password"]["$post"]
  >["json"];
}) {
  return readResponse(
    await rpc.api["request-reset-password"].$post({ json: input.body }),
  );
}

export async function postResetPassword(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["reset-password"]["$post"]
  >["json"];
}) {
  return readResponse(
    await rpc.api["reset-password"].$post({ json: input.body }),
  );
}

export async function postCategories(input: {
  body: InferRequestType<(typeof rpc)["api"]["categories"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["categories"].$post({ json: input.body }));
}

export async function deleteCategoriesId(input: {
  params: {
    path: InferRequestType<
      (typeof rpc)["api"]["categories"][":id"]["$delete"]
    >["param"];
  };
}) {
  return readResponse(
    await rpc.api["categories"][":id"].$delete({ param: input.params.path }),
  );
}

export async function putCategoriesId(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["categories"][":id"]["$put"]
  >["json"];
  params: {
    path: InferRequestType<
      (typeof rpc)["api"]["categories"][":id"]["$put"]
    >["param"];
  };
}) {
  return readResponse(
    await rpc.api["categories"][":id"].$put({
      json: input.body,
      param: input.params.path,
    }),
  );
}

export async function postCategoriesPreset(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["categories"]["preset"]["$post"]
  >["json"];
}) {
  return readResponse(
    await rpc.api["categories"]["preset"].$post({ json: input.body }),
  );
}

export async function getCategoriesPreset(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["categories"]["preset"].$get({}, { init: { signal } }),
  );
}

export async function getCategories(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["categories"].$get({}, { init: { signal } }),
  );
}

export async function postQuizzesMultiple(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["quizzes"]["multiple"]["$post"]
  >["json"];
}) {
  return readResponse(
    await rpc.api["quizzes"]["multiple"].$post({ json: input.body }),
  );
}

export async function postCsvParse(input: {
  body: InferRequestType<(typeof rpc)["api"]["csv"]["parse"]["$post"]>["form"];
}) {
  return readResponse(
    await rpc.api["csv"]["parse"].$post({ form: input.body }),
  );
}

export async function getTags(
  input: {
    params?: {
      query?: InferRequestType<(typeof rpc)["api"]["tags"]["$get"]>["query"];
    };
  } = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["tags"].$get(
      { query: cleanQuery(input.params?.query ?? {}) },
      { init: { signal } },
    ),
  );
}

export async function postInviteCode(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["invite-code"].$post({}, { init: { signal } }),
  );
}

export async function getInviteCode(
  input: {
    params?: {
      query?: InferRequestType<
        (typeof rpc)["api"]["invite-code"]["$get"]
      >["query"];
    };
  } = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["invite-code"].$get(
      { query: cleanQuery(input.params?.query ?? {}) },
      { init: { signal } },
    ),
  );
}

export async function postMylists(input: {
  body: InferRequestType<(typeof rpc)["api"]["mylists"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["mylists"].$post({ json: input.body }));
}

export async function postRegister(input: {
  body: InferRequestType<(typeof rpc)["api"]["register"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["register"].$post({ json: input.body }));
}

export async function putMylists(input: {
  body: InferRequestType<(typeof rpc)["api"]["mylists"]["$put"]>["json"];
}) {
  return readResponse(await rpc.api["mylists"].$put({ json: input.body }));
}

export async function postPractice(input: {
  body: InferRequestType<(typeof rpc)["api"]["practice"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["practice"].$post({ json: input.body }));
}

export async function deleteQuizzesQid(input: {
  params: {
    path: InferRequestType<
      (typeof rpc)["api"]["quizzes"][":qid"]["$delete"]
    >["param"];
  };
}) {
  return readResponse(
    await rpc.api["quizzes"][":qid"].$delete({ param: input.params.path }),
  );
}

export async function putQuizzesQid(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["quizzes"][":qid"]["$put"]
  >["json"];
  params: {
    path: InferRequestType<
      (typeof rpc)["api"]["quizzes"][":qid"]["$put"]
    >["param"];
  };
}) {
  return readResponse(
    await rpc.api["quizzes"][":qid"].$put({
      json: input.body,
      param: input.params.path,
    }),
  );
}

export async function postLike(input: {
  body: InferRequestType<(typeof rpc)["api"]["like"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["like"].$post({ json: input.body }));
}

export async function postUnlike(input: {
  body: InferRequestType<(typeof rpc)["api"]["unlike"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["unlike"].$post({ json: input.body }));
}

export async function getMylists(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(await rpc.api["mylists"].$get({}, { init: { signal } }));
}

export async function postUnregister(input: {
  body: InferRequestType<(typeof rpc)["api"]["unregister"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["unregister"].$post({ json: input.body }));
}

export async function putI(input: {
  body: InferRequestType<(typeof rpc)["api"]["i"]["$put"]>["json"];
}) {
  return readResponse(await rpc.api["i"].$put({ json: input.body }));
}

export async function postIImage(input: {
  body: InferRequestType<(typeof rpc)["api"]["i"]["image"]["$post"]>["form"];
}) {
  return readResponse(await rpc.api["i"]["image"].$post({ form: input.body }));
}

export async function postAuthAvailable(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["auth"]["available"]["$post"]
  >["json"];
}) {
  return readResponse(
    await rpc.api["auth"]["available"].$post({ json: input.body }),
  );
}

export async function postWorkbooks(input: {
  body: InferRequestType<(typeof rpc)["api"]["workbooks"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["workbooks"].$post({ json: input.body }));
}

export async function deleteWorkbooksWid(input: {
  params: {
    path: InferRequestType<
      (typeof rpc)["api"]["workbooks"][":wid"]["$delete"]
    >["param"];
  };
}) {
  return readResponse(
    await rpc.api["workbooks"][":wid"].$delete({ param: input.params.path }),
  );
}

export async function putWorkbooksWid(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["workbooks"][":wid"]["$put"]
  >["json"];
  params: {
    path: InferRequestType<
      (typeof rpc)["api"]["workbooks"][":wid"]["$put"]
    >["param"];
  };
}) {
  return readResponse(
    await rpc.api["workbooks"][":wid"].$put({
      json: input.body,
      param: input.params.path,
    }),
  );
}

export async function getHistoriesSinceUntil(
  input: {
    params: {
      path: InferRequestType<
        (typeof rpc)["api"]["histories"][":since"][":until"]["$get"]
      >["param"];
    };
  },
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["histories"][":since"][":until"].$get(
      { param: input.params.path },
      { init: { signal } },
    ),
  );
}

export async function getQuizzesSize(
  input: {
    params?: {
      query?: InferRequestType<
        (typeof rpc)["api"]["quizzes"]["size"]["$get"]
      >["query"];
    };
  } = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["quizzes"]["size"].$get(
      { query: cleanQuery(input.params?.query ?? {}) },
      { init: { signal } },
    ),
  );
}

export async function getAnalysisRankingAllPeriod(
  input: {
    params: {
      path: InferRequestType<
        (typeof rpc)["api"]["analysis"]["ranking"]["all"][":period"]["$get"]
      >["param"];
    };
  },
  signal?: AbortSignal,
) {
  const data = await readResponse(
    await rpc.api["analysis"]["ranking"]["all"][":period"].$get(
      { param: input.params.path, query: {} },
      { init: { signal } },
    ),
  );
  if (typeof data === "string")
    throw new ApiClientError({
      title: "HTTP_ERROR",
      type: "about:blank",
      status: 500,
      detail: data,
    });
  return data;
}

export async function getAnalysisRankingPersonalPeriod(
  input: {
    params: {
      path: InferRequestType<
        (typeof rpc)["api"]["analysis"]["ranking"]["personal"][":period"]["$get"]
      >["param"];
    };
  },
  signal?: AbortSignal,
) {
  const data = await readResponse(
    await rpc.api["analysis"]["ranking"]["personal"][":period"].$get(
      { param: input.params.path },
      { init: { signal } },
    ),
  );
  if (typeof data === "string")
    throw new ApiClientError({
      title: "HTTP_ERROR",
      type: "about:blank",
      status: 500,
      detail: data,
    });
  return data;
}

export async function getAnalysisStatusDatePeriod(
  input: {
    params: {
      path: InferRequestType<
        (typeof rpc)["api"]["analysis"]["status"][":date"][":period"]["$get"]
      >["param"];
    };
  },
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["analysis"]["status"][":date"][":period"].$get(
      { param: input.params.path },
      { init: { signal } },
    ),
  );
}

export async function getWorkbooks(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["workbooks"].$get({}, { init: { signal } }),
  );
}

export async function postAuthLogin(input: {
  body: InferRequestType<(typeof rpc)["api"]["auth"]["login"]["$post"]>["json"];
}) {
  return readResponse(
    await rpc.api["auth"]["login"].$post({ json: input.body }),
  );
}

export async function postAuthRegister(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["auth"]["register"]["$post"]
  >["json"];
}) {
  return readResponse(
    await rpc.api["auth"]["register"].$post({ json: input.body }),
  );
}

export async function postAuthSignup(input: {
  body: InferRequestType<
    (typeof rpc)["api"]["auth"]["signup"]["$post"]
  >["json"];
}) {
  return readResponse(
    await rpc.api["auth"]["signup"].$post({ json: input.body }),
  );
}

export async function postAuthToken(input: {
  body: InferRequestType<(typeof rpc)["api"]["auth"]["token"]["$post"]>["json"];
}) {
  return readResponse(
    await rpc.api["auth"]["token"].$post({ json: input.body }),
  );
}

export async function postQuizzes(input: {
  body: InferRequestType<(typeof rpc)["api"]["quizzes"]["$post"]>["json"];
}) {
  return readResponse(await rpc.api["quizzes"].$post({ json: input.body }));
}

export async function getQuizzes(
  input: {
    params?: {
      query?: InferRequestType<(typeof rpc)["api"]["quizzes"]["$get"]>["query"];
    };
  } = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["quizzes"].$get(
      { query: cleanQuery(input.params?.query ?? {}) },
      { init: { signal } },
    ),
  );
}

export async function deleteMylists(input: {
  body: InferRequestType<(typeof rpc)["api"]["mylists"]["$delete"]>["json"];
}) {
  return readResponse(await rpc.api["mylists"].$delete({ json: input.body }));
}

export async function getHistories(
  _input: Record<string, never> = {},
  signal?: AbortSignal,
) {
  return readResponse(
    await rpc.api["histories"].$get({}, { init: { signal } }),
  );
}

export const api = {
  getWorkbooksAll,
  getLevels,
  postRequestResetPassword,
  postResetPassword,
  postCategories,
  deleteCategoriesId,
  putCategoriesId,
  postCategoriesPreset,
  getCategoriesPreset,
  getCategories,
  postQuizzesMultiple,
  postCsvParse,
  getTags,
  postInviteCode,
  getInviteCode,
  postMylists,
  postRegister,
  putMylists,
  postPractice,
  deleteQuizzesQid,
  putQuizzesQid,
  postLike,
  postUnlike,
  getMylists,
  postUnregister,
  putI,
  postIImage,
  postAuthAvailable,
  postWorkbooks,
  deleteWorkbooksWid,
  putWorkbooksWid,
  getHistoriesSinceUntil,
  getQuizzesSize,
  getAnalysisRankingAllPeriod,
  getAnalysisRankingPersonalPeriod,
  getAnalysisStatusDatePeriod,
  getWorkbooks,
  postAuthLogin,
  postAuthRegister,
  postAuthSignup,
  postAuthToken,
  postQuizzes,
  getQuizzes,
  deleteMylists,
  getHistories,
};
