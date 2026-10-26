import { Expression, SqlBool, sql } from "kysely";
import IQuizQueryService, {
  countOption,
  findOption,
} from "@/applications/queryservices/IQuizQueryService.js";
import IQuizRepository from "@/domains/Quiz/IQuizRepository.js";
import Quiz from "@/domains/Quiz/index.js";
import { ApiError } from "@/http/ApiError.js";
import type { QuizDTO as ApiQuizDTO } from "@/types/dto.js";
import CategoryInfra from "./CategoryInfra.js";
import KyselyClientManager from "./kysely/KyselyClientManager.js";

type QuizDTO = ApiQuizDTO;

export default class QuizInfra implements IQuizRepository, IQuizQueryService {
  constructor(
    private clientManager: KyselyClientManager,
    private categoryInfra: CategoryInfra,
  ) {}

  private latestHistory(userId: number) {
    return this.clientManager
      .getClient()
      .selectFrom("histories")
      .select(["quiz_id", "judgement", "practiced"])
      .select(
        sql<number>`ROW_NUMBER() OVER (PARTITION BY quiz_id ORDER BY practiced DESC)`.as(
          "row_num",
        ),
      )
      .where("user_id", "=", userId)
      .as("latest");
  }

  private async filteredQuery(uid: string, option: countOption) {
    const client = this.clientManager.getClient();
    const { id: userId } = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", uid)
      .executeTakeFirstOrThrow();
    let query = client
      .selectFrom("quizzes")
      .innerJoin("users as creators", "creators.id", "quizzes.creator_id")
      .leftJoin("workbooks", "quizzes.workbook_id", "workbooks.id")
      .leftJoin(
        "users as wb_creators",
        "workbooks.creator_id",
        "wb_creators.id",
      )
      .where("quizzes.creator_id", "=", userId);
    const array = <T>(value: T | T[] | null | undefined): T[] =>
      value == null ? [] : [...new Set(Array.isArray(value) ? value : [value])];
    const wids = array(option.wids);
    if (wids.length) query = query.where("workbooks.wid", "in", wids);
    const categories = array(option.categories);
    if (categories.length)
      query = query.where("quizzes.category_id", "in", categories);
    if (option.keyword) {
      const target = option.keywordOption ?? 1;
      query = query.where((eb) => {
        const matches: Expression<SqlBool>[] = [];
        if (target !== 3)
          matches.push(eb("quizzes.que", "like", `%${option.keyword}%`));
        if (target !== 2)
          matches.push(eb("quizzes.ans", "like", `%${option.keyword}%`));
        return eb.or(matches);
      });
    }
    const tags = array(option.tags);
    if (tags.length) {
      // EXISTS keeps one outer row per quiz, even with multiple matching tags.
      for (const labels of option.tagMatchAll
        ? tags.map((label) => [label])
        : [tags]) {
        query = query.where((eb) =>
          eb.exists(
            eb
              .selectFrom("tagging")
              .innerJoin("tags", "tags.id", "tagging.tag_id")
              .select("tagging.quiz_id")
              .whereRef("tagging.quiz_id", "=", "quizzes.id")
              .where("tags.label", "in", labels),
          ),
        );
      }
    }
    if (option.isFavorite)
      query = query.where((eb) =>
        eb.exists(
          eb
            .selectFrom("favorites")
            .select("quiz_id")
            .whereRef("favorites.quiz_id", "=", "quizzes.id")
            .where("favorites.user_id", "=", userId),
        ),
      );
    if (option.mid)
      query = query.where((eb) =>
        eb.exists(
          eb
            .selectFrom("mylists_quizzes")
            .innerJoin("mylists", "mylists.id", "mylists_quizzes.mylist_id")
            .select("quiz_id")
            .whereRef("mylists_quizzes.quiz_id", "=", "quizzes.id")
            .where("mylists.mid", "=", option.mid!)
            .where("mylists.user_id", "=", userId),
        ),
      );
    const judgements = array(option.judgements);
    if (option.since != null || option.until != null || judgements.length) {
      query = query.where((eb) => {
        let history = eb
          .selectFrom(this.latestHistory(userId))
          .select("latest.quiz_id")
          .whereRef("latest.quiz_id", "=", "quizzes.id")
          .where("latest.row_num", "=", 1);
        if (option.since != null)
          history = history.where(
            "latest.practiced",
            ">=",
            new Date(option.since),
          );
        if (option.until != null)
          history = history.where(
            "latest.practiced",
            "<=",
            new Date(option.until),
          );
        if (judgements.length) {
          const answered = judgements.filter((value) => value !== 3);
          history = answered.length
            ? history.where("latest.judgement", "in", answered)
            : history.where(sql<boolean>`false`);
        }
        const matches: Expression<SqlBool>[] = [eb.exists(history)];
        if (
          judgements.includes(3) &&
          option.since == null &&
          option.until == null
        ) {
          matches.push(
            eb.not(
              eb.exists(
                eb
                  .selectFrom("histories")
                  .select("quiz_id")
                  .whereRef("histories.quiz_id", "=", "quizzes.id")
                  .where("histories.user_id", "=", userId),
              ),
            ),
          );
        }
        return eb.or(matches);
      });
    }
    if (option.crctAnsRatio) {
      const total = sql<number>`COALESCE(quizzes.total_crct_ans, 0) + COALESCE(quizzes.total_wrng_ans, 0) + COALESCE(quizzes.total_through_ans, 0)`;
      query = query
        .where(total, ">", 0)
        .where(
          sql<number>`100.0 * COALESCE(quizzes.total_crct_ans, 0) / NULLIF((${total}), 0)`,
          ">=",
          option.crctAnsRatio[0],
        )
        .where(
          sql<number>`100.0 * COALESCE(quizzes.total_crct_ans, 0) / NULLIF((${total}), 0)`,
          "<=",
          option.crctAnsRatio[1],
        );
    }
    return { query, userId };
  }

  async findMany(uid: string, option: findOption = {}): Promise<QuizDTO[]> {
    const client = this.clientManager.getClient();
    const { query: filtered, userId } = await this.filteredQuery(uid, option);
    let query = filtered
      .leftJoin(this.latestHistory(userId), (join) =>
        join
          .onRef("latest.quiz_id", "=", "quizzes.id")
          .on("latest.row_num", "=", 1),
      )
      .select([
        "quizzes.id as id",
        "quizzes.qid as qid",
        "quizzes.que as question",
        "quizzes.ans as answer",
        "quizzes.anoans as anotherAnswer",
        "quizzes.category_id as categoryId",
        "quizzes.total_crct_ans as right",
        "creators.uid as creatorId",
        "workbooks.id as workbookId",
        "workbooks.wid as wid",
        "workbooks.name as wbName",
        "workbooks.date as wbDate",
        "wb_creators.uid as wbCreatorId",
        "latest.judgement as judgement",
        sql<number>`COALESCE(quizzes.total_crct_ans, 0) + COALESCE(quizzes.total_through_ans, 0) + COALESCE(quizzes.total_wrng_ans, 0)`.as(
          "total",
        ),
      ]);
    // Tie each sort key to the quiz so query scan order cannot change the shuffle.
    if (option.seed != null)
      query = query.orderBy(sql`MD5(CONCAT(${option.seed}, ':', quizzes.qid))`);
    if (option.isFavorite)
      query = query.orderBy(
        (eb) =>
          eb
            .selectFrom("favorites")
            .select("registered")
            .whereRef("favorites.quiz_id", "=", "quizzes.id")
            .where("user_id", "=", userId),
        "desc",
      );
    if (option.since != null || option.until != null)
      query = query.orderBy("latest.practiced", "desc");
    if (option.mid)
      query = query.orderBy(
        (eb) =>
          eb
            .selectFrom("mylists_quizzes")
            .innerJoin("mylists", "mylists.id", "mylists_quizzes.mylist_id")
            .select("registered")
            .whereRef("mylists_quizzes.quiz_id", "=", "quizzes.id")
            .where("mylists.mid", "=", option.mid!)
            .where("mylists.user_id", "=", userId),
        "desc",
      );
    const maxView = option.maxView ?? 100;
    const quizzes = await query
      .orderBy("quizzes.id", "desc")
      .limit(maxView)
      .offset(maxView * ((option.page ?? 1) - 1))
      .execute();

    if (quizzes.length === 0) return [];

    const quizIds = quizzes.map((q) => q.id);
    const categoryIds = [
      ...new Set(quizzes.map((q) => q.categoryId).filter(Boolean)),
    ] as number[];
    const allMylists = await client
      .selectFrom("mylists_quizzes")
      .innerJoin("mylists", "mylists_quizzes.mylist_id", "mylists.id")
      .select([
        "mylists_quizzes.quiz_id",
        "mylists.id as mylist_id",
        "mylists.mid",
        "mylists.name",
        "mylists.created",
      ])
      .where("mylists.user_id", "=", userId)
      .where("mylists_quizzes.quiz_id", "in", quizIds)
      .execute();
    const mylistIds = [...new Set(allMylists.map((m) => m.mylist_id))];

    const workbookIds = [
      ...new Set(
        quizzes
          .map((q) => q.workbookId)
          .filter((id): id is number => id !== null),
      ),
    ];

    const [allTags, allFavorites, allVisibleUsers, mylistStats, workbookStats] =
      await Promise.all([
        // タグ一括取得
        client
          .selectFrom("tagging")
          .innerJoin("tags", "tagging.tag_id", "tags.id")
          .select([
            "tagging.quiz_id",
            "tags.label",
            "tags.created",
            "tags.modified",
          ])
          .where("tagging.quiz_id", "in", quizIds)
          .execute(),

        // お気に入り状況一括取得
        client
          .selectFrom("favorites")
          .select("quiz_id")
          .where("user_id", "=", userId)
          .where("quiz_id", "in", quizIds)
          .execute(),

        // 公開範囲設定の有無を一括取得
        client
          .selectFrom("quiz_visible_users")
          .select("quiz_id")
          .where("quiz_id", "in", quizIds)
          .execute(),

        mylistIds.length > 0
          ? client
              .selectFrom("mylists_quizzes")
              .leftJoin("histories", (join) =>
                join
                  .onRef("histories.quiz_id", "=", "mylists_quizzes.quiz_id")
                  .on("histories.user_id", "=", userId),
              )
              .select(({ fn }) => [
                "mylists_quizzes.mylist_id",
                fn
                  .count<number>("mylists_quizzes.quiz_id")
                  .distinct()
                  .as("total"),
                sql<number>`COALESCE(SUM(CASE WHEN histories.judgement = 1 THEN 1 ELSE 0 END), 0)`.as(
                  "corrects",
                ),
                sql<number>`COALESCE(SUM(CASE WHEN histories.judgement = 0 THEN 1 ELSE 0 END), 0)`.as(
                  "wrongs",
                ),
                sql<number>`COALESCE(SUM(CASE WHEN histories.judgement = 2 THEN 1 ELSE 0 END), 0)`.as(
                  "ignored",
                ),
                fn.max("histories.practiced").as("lastPracticed"),
              ])
              .where("mylists_quizzes.mylist_id", "in", mylistIds)
              .groupBy("mylists_quizzes.mylist_id")
              .execute()
          : Promise.resolve([]),

        workbookIds.length > 0
          ? client
              .selectFrom("quizzes")
              .leftJoin("histories", (join) =>
                join
                  .onRef("histories.quiz_id", "=", "quizzes.id")
                  .on("histories.user_id", "=", userId),
              )
              .select(({ fn }) => [
                "quizzes.workbook_id",
                fn.count<number>("quizzes.id").distinct().as("total"),
                sql<number>`COALESCE(SUM(CASE WHEN histories.judgement = 1 THEN 1 ELSE 0 END), 0)`.as(
                  "corrects",
                ),
                sql<number>`COALESCE(SUM(CASE WHEN histories.judgement = 0 THEN 1 ELSE 0 END), 0)`.as(
                  "wrongs",
                ),
                sql<number>`COALESCE(SUM(CASE WHEN histories.judgement = 2 THEN 1 ELSE 0 END), 0)`.as(
                  "ignored",
                ),
                fn.max("histories.practiced").as("lastPracticed"),
              ])
              .where("quizzes.workbook_id", "in", workbookIds)
              .groupBy("quizzes.workbook_id")
              .execute()
          : Promise.resolve([]),
      ]);

    const categories = await this.categoryInfra.findChainsByIds(categoryIds);
    const groupByQuiz = <T extends { quiz_id: number }>(rows: T[]) => {
      const grouped = new Map<number, T[]>();
      for (const row of rows) {
        const group = grouped.get(row.quiz_id) ?? [];
        group.push(row);
        grouped.set(row.quiz_id, group);
      }
      return grouped;
    };
    const tagsByQuiz = groupByQuiz(allTags);
    const mylistsByQuiz = groupByQuiz(allMylists);
    const favoriteIds = new Set(allFavorites.map((row) => row.quiz_id));
    const restrictedIds = new Set(allVisibleUsers.map((row) => row.quiz_id));
    const mylistStatsM = new Map(
      mylistStats.map((stat) => [stat.mylist_id, stat]),
    );
    const workbookStatsM = new Map(
      workbookStats.flatMap((stat) =>
        stat.workbook_id === null ? [] : ([[stat.workbook_id, stat]] as const),
      ),
    );

    return quizzes.map((q) => {
      const targetWorkbookId = q.workbookId;
      const workbookStats =
        targetWorkbookId === null
          ? undefined
          : workbookStatsM.get(targetWorkbookId);

      return {
        qid: q.qid,
        question: q.question,
        answer: q.answer,
        anotherAnswer: q.anotherAnswer,
        creatorId: q.creatorId,
        isPublic: !restrictedIds.has(q.id),
        isFavorite: favoriteIds.has(q.id),
        right: q.right || 0,
        total: q.total || 0,
        workbook: q.wid
          ? {
              wid: q.wid,
              name: q.wbName || "",
              date: q.wbDate,
              creatorId: q.wbCreatorId || "",
              total: Number(workbookStats?.total || 0),
              corrects: Number(workbookStats?.corrects || 0),
              wrongs: Number(workbookStats?.wrongs || 0),
              ignored: Number(workbookStats?.ignored || 0),
              lastPracticedAt: workbookStats?.lastPracticed
                ? new Date(workbookStats.lastPracticed)
                : null,
            }
          : null,
        tags: (tagsByQuiz.get(q.id) ?? []).map((t) => ({
          label: t.label,
          created: t.created,
          modified: t.modified,
        })),
        registerdMylist: (mylistsByQuiz.get(q.id) ?? []).map((m) => {
          const stats = mylistStatsM.get(m.mylist_id);
          return {
            mid: m.mid,
            name: m.name,
            created: m.created,
            total: Number(stats?.total || 0),
            corrects: Number(stats?.corrects || 0),
            wrongs: Number(stats?.wrongs || 0),
            ignored: Number(stats?.ignored || 0),
            lastPracticed: stats?.lastPracticed
              ? new Date(stats.lastPracticed)
              : null,
          };
        }),
        judgement: q.judgement ?? undefined,
        category:
          q.categoryId == null ? [] : (categories.get(q.categoryId) ?? []),
      };
    });
  }

  async count(uid: string, option: countOption = {}): Promise<number> {
    const { query } = await this.filteredQuery(uid, option);
    const result = await query
      .select(({ fn }) => fn.countAll<number>().as("size"))
      .executeTakeFirstOrThrow();
    return Number(result.size);
  }

  async findQidById(id: number): Promise<string | null> {
    const row = await this.clientManager
      .getClient()
      .selectFrom("quizzes")
      .select("qid")
      .where("id", "=", id)
      .executeTakeFirst();
    return row?.qid ?? null;
  }

  async findByQid(qid: string): Promise<Quiz | null> {
    const client = this.clientManager.getClient();

    const quiz = await client
      .selectFrom("quizzes")
      .leftJoin("workbooks", "quizzes.workbook_id", "workbooks.id")
      .leftJoin("levels", "workbooks.level_id", "levels.id")
      .innerJoin("users", "users.id", "quizzes.creator_id")
      .select([
        "quizzes.id as quizId",
        "quizzes.qid as qid",
        "quizzes.que as question",
        "quizzes.ans as answer",
        "quizzes.anoans as anotherAnswer",
        "workbooks.wid as wid",
        "users.uid as creatorUid",
        "quizzes.category_id as categoryId",
        "quizzes.sub_category_id as subCategoryId",
        "quizzes.total_crct_ans as right",
        sql<number>`total_crct_ans + total_through_ans + total_wrng_ans`.as(
          "total",
        ),
      ])
      .where("quizzes.qid", "=", qid)
      .executeTakeFirst();

    if (!quiz) return null;

    return Quiz.reconstruct(
      quiz.qid,
      quiz.question,
      quiz.answer,
      quiz.total,
      quiz.right || 0,
      quiz.creatorUid,
      quiz.wid,
      quiz.anotherAnswer,
      quiz.categoryId,
    );
  }

  private async resolveReferences(quiz: Quiz) {
    const client = this.clientManager.getClient();
    const user = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", quiz.creatorUid)
      .executeTakeFirstOrThrow();
    const [workbook, category] = await Promise.all([
      quiz.wid == null
        ? undefined
        : client
            .selectFrom("workbooks")
            .select("id")
            .where("wid", "=", quiz.wid)
            .where("creator_id", "=", user.id)
            .executeTakeFirst(),
      quiz.categoryId == null
        ? undefined
        : client
            .selectFrom("categories")
            .select("id")
            .where("id", "=", quiz.categoryId)
            .executeTakeFirst(),
    ]);
    if (
      (quiz.wid != null && !workbook) ||
      (quiz.categoryId != null && !category)
    )
      throw new ApiError().invalidParams("Unknown workbook or category.");
    return { workbookId: workbook?.id ?? null, userId: user.id };
  }

  async save(quiz: Quiz): Promise<void> {
    const client = this.clientManager.getClient();

    const { workbookId, userId } = await this.resolveReferences(quiz);
    await client
      .insertInto("quizzes")
      .values({
        qid: quiz.qid,
        que: quiz.question,
        ans: quiz.answer,
        anoans: quiz.anotherAnswer,
        workbook_id: workbookId,
        creator_id: userId,
        category_id: quiz.categoryId,
      })
      .execute();
  }

  async update(quiz: Quiz): Promise<void> {
    const client = this.clientManager.getClient();

    const { workbookId, userId } = await this.resolveReferences(quiz);
    await client
      .updateTable("quizzes")
      .set({
        que: quiz.question,
        ans: quiz.answer,
        anoans: quiz.anotherAnswer,
        workbook_id: workbookId,
        creator_id: userId,
        category_id: quiz.categoryId,
      })
      .where("qid", "=", quiz.qid)
      .executeTakeFirstOrThrow();
  }

  async delete(quiz: Quiz): Promise<void> {
    const client = this.clientManager.getClient();
    await client.deleteFrom("quizzes").where("qid", "=", quiz.qid).execute();
  }
}
