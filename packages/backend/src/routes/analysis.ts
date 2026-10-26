import { Hono } from "hono";
import type { AppEnv } from "@/http/context.js";
import {
  getAnalysisStatusDatePeriod,
  getAnalysisRankingAllPeriod,
  getAnalysisRankingAllPeriodQuery,
  getAnalysisRankingPersonalPeriod,
} from "@/http/schemas.js";
import { validate } from "@/http/validate.js";
import { sql } from "kysely";
import { db } from "@/database.js";
import type { Period } from "@/plugins/day.js";
import dayjs, { generateRange } from "@/plugins/day.js";

const router = new Hono<AppEnv>()
  .get(
    "/status/:date/:period",
    validate("param", getAnalysisStatusDatePeriod.param),
    async (c) => {
      const param = c.req.valid("param");
      const userId = c.get("user").userId;
      const date = param.date;
      const _period = param.period;

      const period: Period =
        _period == "week" || _period == "month" ? _period : "day";
      const ranges = generateRange(date, period);

      try {
        const results = await Promise.all(
          ranges.map(async (range) => {
            const start = dayjs(range[0]).format("YYYY-MM-DD hh:mm:ss");
            const end = dayjs(range[1]).format("YYYY-MM-DD hh:mm:ss");

            return {
              start,
              end,
              right:
                Number(
                  (
                    await db
                      .selectFrom("histories")
                      .select(({ fn }) => [fn.count("quiz_id").as("count")])
                      .where(({ eb, and, between }) =>
                        and([
                          eb("user_id", "=", userId),
                          eb("judgement", "=", 1),
                          between("practiced", range[0], range[1]),
                        ]),
                      )
                      .executeTakeFirst()
                  )?.count,
                ) || 0,

              wrong:
                Number(
                  (
                    await db
                      .selectFrom("histories")
                      .select(({ fn }) => [fn.count("quiz_id").as("count")])
                      .where(({ eb, and, between }) =>
                        and([
                          eb("user_id", "=", userId),
                          eb("judgement", "=", 0),
                          between("practiced", range[0], range[1]),
                        ]),
                      )
                      .executeTakeFirst()
                  )?.count,
                ) || 0,

              through:
                Number(
                  (
                    await db
                      .selectFrom("histories")
                      .select(({ fn }) => [fn.count("quiz_id").as("count")])
                      .where(({ eb, and, between }) =>
                        and([
                          eb("user_id", "=", userId),
                          eb("judgement", "=", 2),
                          between("practiced", range[0], range[1]),
                        ]),
                      )
                      .executeTakeFirst()
                  )?.count,
                ) || 0,
            };
          }),
        );

        return c.json(results, 200);
      } catch (e) {
        throw e;
      }
    },
  )
  .get(
    "/ranking/all/:period",
    validate("param", getAnalysisRankingAllPeriod.param),
    validate("query", getAnalysisRankingAllPeriodQuery),
    async (c) => {
      const param = c.req.valid("param");
      const query = c.req.valid("query");
      const _period = param.period;
      const limit =
        !!query.limit || Number(query.limit) > 5 ? Number(query.limit) : 5;
      const now = dayjs().format();

      const period: Period =
        _period == "week" || _period == "month" ? _period : "day";

      const ranges = generateRange(now, period);

      try {
        const nowRanking = await db
          .selectFrom("histories")
          .innerJoin("users", "user_id", "users.id")
          .select(({ fn }) => [
            "users.uid as uid",
            "users.nickname as nickname",
            "users.username as username",
            fn.count("histories.quiz_id").as("count"),
            sql<number>`RANK() OVER(ORDER BY COUNT(histories.quiz_id) DESC)`.as(
              "rank",
            ),
          ])
          .where(({ between }) =>
            between("practiced", ranges[0][0], ranges[0][1]),
          )
          .groupBy("user_id")
          .orderBy("rank")
          .limit(limit)
          .execute();

        const prevRanking = await db
          .selectFrom("histories")
          .innerJoin("users", "user_id", "users.id")
          .select(({ fn }) => [
            "users.uid as uid",
            "users.nickname as nickname",
            "users.username as username",
            fn.count("histories.quiz_id").as("count"),
            sql<number>`RANK() OVER(ORDER BY COUNT(histories.quiz_id) DESC)`.as(
              "rank",
            ),
          ])
          .where(({ between }) =>
            between("practiced", ranges[5][0], ranges[5][1]),
          )
          .groupBy("user_id")
          .orderBy("rank")
          .limit(limit)
          .execute();

        const ranking = nowRanking.map((n) => {
          const prev = prevRanking.filter((p) => p.uid === n.uid)[0];
          const compare = !!prev ? n.rank - prev.rank : 1;

          return {
            ...n,
            compare,
          };
        });

        return c.json(ranking, 200);
      } catch (e) {
        console.error(e);
        return c.text("An Error Occured", 200);
      }
    },
  )
  .get(
    "/ranking/personal/:period",
    validate("param", getAnalysisRankingPersonalPeriod.param),
    async (c) => {
      const param = c.req.valid("param");
      const _period = param.period;
      const userId = c.get("user").userId;
      const now = dayjs().format("YYYY-MM-DD HH:mm:ss");

      const period: Period =
        _period == "week" || _period == "month" ? _period : "day";

      const ranges = generateRange(now, period);

      try {
        const nowRank = await db
          .selectFrom("histories")
          .innerJoin("users", "histories.user_id", "users.id")
          .select(({ fn }) => [
            "users.nickname as nickname",
            "users.username as username",
            fn.count("histories.quiz_id").as("count"),
          ])
          .where(({ eb, and, between }) =>
            and([
              eb("user_id", "=", userId),
              between("histories.practiced", ranges[6][0], ranges[6][1]),
            ]),
          )
          .groupBy("user_id")
          .execute();

        const prevRank = await db
          .selectFrom("histories")
          .innerJoin("users", "histories.user_id", "users.id")
          .select(({ fn }) => [
            "users.nickname as nickname",
            "users.username as username",
            fn.count("histories.quiz_id").as("count"),
          ])
          .where(({ eb, and, between }) =>
            and([
              eb("user_id", "=", userId),
              between("histories.practiced", ranges[5][0], ranges[5][1]),
            ]),
          )
          .groupBy("user_id")
          .execute();

        const isNodata = nowRank.length == 0;

        const ranking = {
          rank: nowRank.length,
          username: isNodata ? "" : nowRank[0].username,
          nickname: isNodata ? "" : nowRank[0].nickname,
          count: isNodata ? 0 : nowRank[0].count,
          compare: nowRank.length - prevRank.length,
          userId,
        };

        return c.json(ranking, 200);
      } catch (e) {
        console.error(e);
        return c.text("An Error Occured", 200);
      }
    },
  );
export default router;
