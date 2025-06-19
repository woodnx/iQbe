import express from "express";
import { sql } from "kysely";
import { db } from "@/database";
import type { Period } from "@/plugins/day";
import dayjs, { generateRange } from "@/plugins/day";
import { typedWrapper } from "@/utils/wrappers";

const router = express.Router();

router.get(
  "/status/:date/:period",
  typedWrapper<"/analysis/status/{date}/{period}", "get">(
    async (req, res, next) => {
      const userId = req.user.userId;
      const date = req.params.date;
      const _period = req.params.period;

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

        res.status(200).send(results);
      } catch (e) {
        next(e);
      }
    },
  ),
);

router.get("/ranking/all/:period", async (req, res) => {
  const _period = req.params.period;
  const limit =
    !!req.query.limit || Number(req.query.limit) > 5
      ? Number(req.query.limit)
      : 5;
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
      .where(({ between }) => between("practiced", ranges[0][0], ranges[0][1]))
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
      .where(({ between }) => between("practiced", ranges[5][0], ranges[5][1]))
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

    res.status(200).send(ranking);
  } catch (e) {
    console.error(e);
    res.send("An Error Occured");
  }
});

router.get("/ranking/personal/:period", async (req, res) => {
  const _period = req.params.period;
  const userId = req.user.userId;
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

    res.status(200).send(ranking);
  } catch (e) {
    console.error(e);
    res.send("An Error Occured");
  }
});

module.exports = router;
