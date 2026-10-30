import { sql } from "kysely";
import { db } from "@/database.js";
import type { Period } from "@/plugins/day.js";
import dayjs, { generateRange } from "@/plugins/day.js";

export default class AnalysisQueryService {
  async status(userId: number, date: string, period: Period) {
    const ranges = generateRange(date, period);
    const periods = sql.join(
      ranges.map((_, index) => sql`SELECT ${index} AS bucket`),
      sql` UNION ALL `,
    );
    // Assign each history to its period once. A range join against seven periods
    // can cause MySQL to read the same user's history seven times.
    const bucket = sql`CASE ${sql.join(
      ranges
        .slice(0, -1)
        .map(([start], index) => sql`WHEN practiced >= ${start} THEN ${index}`),
      sql` `,
    )} ELSE 6 END`;
    const counts = sql`
      SELECT ${bucket} AS bucket,
        SUM(CASE WHEN judgement = 1 THEN 1 ELSE 0 END) AS right_count,
        SUM(CASE WHEN judgement = 0 THEN 1 ELSE 0 END) AS wrong_count,
        SUM(CASE WHEN judgement = 2 THEN 1 ELSE 0 END) AS through_count
      FROM histories
      WHERE user_id = ${userId} AND practiced >= ${ranges[6][0]} AND practiced < ${ranges[0][1]}
      GROUP BY bucket
    `;
    const result = await sql<{
      bucket: number;
      right_count: number;
      wrong_count: number;
      through_count: number;
    }>`
      SELECT periods.bucket,
        COALESCE(counts.right_count, 0) AS right_count,
        COALESCE(counts.wrong_count, 0) AS wrong_count,
        COALESCE(counts.through_count, 0) AS through_count
      FROM (${periods}) AS periods
      LEFT JOIN (${counts}) AS counts ON counts.bucket = periods.bucket
      ORDER BY periods.bucket
    `.execute(db);
    return result.rows.map((row) => {
      const [start, end] = ranges[row.bucket];
      return {
        start: dayjs(start).tz("Asia/Tokyo").format("YYYY-MM-DD HH:mm:ss"),
        end: dayjs(end)
          .tz("Asia/Tokyo")
          .subtract(1, "second")
          .format("YYYY-MM-DD HH:mm:ss"),
        right: Number(row.right_count),
        wrong: Number(row.wrong_count),
        through: Number(row.through_count),
      };
    });
  }

  async ranking(period: Period, limit: number) {
    const ranges = generateRange(dayjs().toISOString(), period);

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
      .where("practiced", ">=", ranges[0][0])
      .where("practiced", "<", ranges[0][1])
      .groupBy(["users.id", "users.uid", "users.nickname", "users.username"])
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
      .where("practiced", ">=", ranges[5][0])
      .where("practiced", "<", ranges[5][1])
      .groupBy(["users.id", "users.uid", "users.nickname", "users.username"])
      .orderBy("rank")
      .limit(limit)
      .execute();

    const previousByUid = new Map(prevRanking.map((row) => [row.uid, row]));
    const ranking = nowRanking.map((n) => {
      const prev = previousByUid.get(n.uid);
      const compare = !!prev ? n.rank - prev.rank : 1;

      return {
        ...n,
        compare,
      };
    });

    return ranking;
  }

  async personalRanking(userId: number, period: Period) {
    const ranges = generateRange(dayjs().toISOString(), period);

    const nowRank = await db
      .selectFrom("histories")
      .innerJoin("users", "histories.user_id", "users.id")
      .select(({ fn }) => [
        "users.nickname as nickname",
        "users.username as username",
        fn.count("histories.quiz_id").as("count"),
      ])
      .where(({ eb, and }) =>
        and([
          eb("user_id", "=", userId),
          eb("histories.practiced", ">=", ranges[6][0]),
          eb("histories.practiced", "<", ranges[6][1]),
        ]),
      )
      .groupBy(["users.id", "users.nickname", "users.username"])
      .execute();

    const prevRank = await db
      .selectFrom("histories")
      .innerJoin("users", "histories.user_id", "users.id")
      .select(({ fn }) => [
        "users.nickname as nickname",
        "users.username as username",
        fn.count("histories.quiz_id").as("count"),
      ])
      .where(({ eb, and }) =>
        and([
          eb("user_id", "=", userId),
          eb("histories.practiced", ">=", ranges[5][0]),
          eb("histories.practiced", "<", ranges[5][1]),
        ]),
      )
      .groupBy(["users.id", "users.nickname", "users.username"])
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

    return ranking;
  }
}
