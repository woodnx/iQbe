import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import {
  getAnalysisRankingAllPeriod,
  getAnalysisRankingAllPeriodQuery,
  getAnalysisRankingPersonalPeriod,
  getAnalysisStatusDatePeriod,
} from "@/http/schemas.js";
import { validate } from "@/http/validate.js";
import AnalysisQueryService from "@/interfaces/infra/AnalysisQueryService.js";

const analysis = new AnalysisQueryService();
const router = new Hono<AppEnv>()
  .get(
    "/status/:date/:period",
    validate("param", getAnalysisStatusDatePeriod.param),
    async (c) => {
      const { date, period } = c.req.valid("param");
      return c.json(await analysis.status(c.get("user").userId, date, period));
    },
  )
  .get(
    "/ranking/all/:period",
    validate("param", getAnalysisRankingAllPeriod.param),
    validate("query", getAnalysisRankingAllPeriodQuery),
    async (c) =>
      c.json(
        await analysis.ranking(
          c.req.valid("param").period,
          c.req.valid("query").limit,
        ),
      ),
  )
  .get(
    "/ranking/personal/:period",
    validate("param", getAnalysisRankingPersonalPeriod.param),
    async (c) =>
      c.json(
        await analysis.personalRanking(
          c.get("user").userId,
          c.req.valid("param").period,
        ),
      ),
  );
export default router;
