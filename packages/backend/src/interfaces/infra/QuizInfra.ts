import { components } from "api/schema";
import dayjs from "dayjs";
import { Expression, SqlBool, sql } from "kysely";
import IQuizQueryService, {
  countOption,
  findOption,
} from "@/applications/queryservices/IQuizQueryService";
import Quiz from "@/domains/Quiz";
import IQuizRepository from "@/domains/Quiz/IQuizRepository";
import CategoryInfra from "./CategoryInfra";
import KyselyClientManager from "./kysely/KyselyClientManager";

type QuizDTO = components["schemas"]["Quiz"];

export default class QuizInfra implements IQuizRepository, IQuizQueryService {
  constructor(
    private clientManager: KyselyClientManager,
    private categoryInfra: CategoryInfra,
  ) {}

  async findMany(uid: string, option: findOption = {}): Promise<QuizDTO[]> {
    const client = this.clientManager.getClient();

    // ユーザIDの取得
    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", uid)
      .executeTakeFirstOrThrow()
      .then((u) => u.id);

    // メインクエリの構築
    let query = client
      .selectFrom("quizzes")
      .innerJoin("users as creators", "creators.id", "quizzes.creator_id")
      .leftJoin("workbooks", "quizzes.workbook_id", "workbooks.id")
      .leftJoin(
        "users as wb_creators",
        "workbooks.creator_id",
        "wb_creators.id",
      )
      .select(({ fn }) => [
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
        sql<number>`quizzes.total_crct_ans + quizzes.total_through_ans + quizzes.total_wrng_ans`.as(
          "total",
        ),
        fn.countAll<number>().over().as("size"),
      ])
      .where("quizzes.creator_id", "=", userId);

    // フィルタリング・ソート
    if (option.wids?.length) {
      query = Array.isArray(option.wids)
        ? query.where("workbooks.wid", "in", option.wids)
        : query.where("workbooks.wid", "=", option.wids);
    }
    if (option.seed) query = query.orderBy(sql`RAND(${option.seed})`);
    if (option.keyword && option.keywordOption) {
      query = query.where((eb) => {
        const keyword = option.keyword || "";
        const ors: Expression<SqlBool>[] = [];

        if (option.keywordOption !== 3) {
          ors.push(eb("quizzes.que", "like", `%${keyword}%`));
        }

        if (option.keywordOption !== 2) {
          ors.push(eb("quizzes.ans", "like", `%${keyword}%`));
        }

        return eb.or(ors);
      });
    }
    if (!!option.categories) {
      if (Array.isArray(option.categories) && option.categories.length)
        query = query.where("quizzes.category_id", "in", option.categories);
      else query = query.where("quizzes.category_id", "=", option.categories);
    }
    if (!!option.tags) {
      if (Array.isArray(option.tags) && option.tags.length) {
        if (option.tagMatchAll) {
          query = query
            .innerJoin("tagging", "tagging.quiz_id", "quizzes.id")
            .innerJoin("tags", "tagging.tag_id", "tags.id")
            .where("tags.label", "in", option.tags)
            .groupBy("quizzes.id")
            .having(
              ({ fn }) => fn.count("tags.label"),
              "=",
              option.tags.length,
            );
        } else {
          query = query
            .innerJoin("tagging", "tagging.quiz_id", "quizzes.id")
            .innerJoin("tags", "tagging.tag_id", "tags.id")
            .where("tags.label", "in", option.tags);
        }
      } else {
        query = query
          .innerJoin("tagging", "tagging.quiz_id", "quizzes.id")
          .innerJoin("tags", "tagging.tag_id", "tags.id")
          .where("tags.label", "=", option.tags);
      }
    }
    // if (!!crctAnsRatio) {
    //   query = query.where(sql`quiz.total_crct_ans / (quiz.total_crct_ans + quiz.total_wrng_ans + quiz.total_through_ans) * 100 BETWEEN ${crctAnsRatio[0]} AND ${crctAnsRatio[1]}`)
    // }

    if (option.isFavorite) {
      query = query
        .innerJoin("favorites", "favorites.quiz_id", "quizzes.id")
        .select("favorites.registered")
        .where("favorites.user_id", "=", userId)
        .orderBy("favorites.registered", "desc");
    }
    if (!!option.since && !!option.until) {
      const since = dayjs(option.since).toDate();
      const until = dayjs(option.until).toDate();

      query = query
        .innerJoin("histories", "histories.quiz_id", "quizzes.id")
        .select([
          "histories.judgement as judgement",
          "histories.practiced as practiced",
        ])
        .where("histories.user_id", "=", userId)
        .where(({ eb, and, between }) =>
          !!option.judgements
            ? and([
                eb("histories.judgement", "in", option.judgements),
                between("histories.practiced", since, until),
              ])
            : between("histories.practiced", since, until),
        )
        .orderBy("histories.practiced", "desc");
    }
    if (!!option.mid) {
      query = query
        .innerJoin("mylists_quizzes", "mylists_quizzes.quiz_id", "quizzes.id")
        .innerJoin("mylists", "mylists.id", "mylists_quizzes.mylist_id")
        .select("mylists_quizzes.registered")
        .where("mylists.mid", "=", option.mid)
        .where("mylists.user_id", "=", userId)
        .orderBy("mylists_quizzes.registered", "desc");
    }

    const maxView = option.maxView || 100;
    const page = option.page || 1;

    // execute
    const quizzes = await query
      .limit(maxView)
      .offset(maxView * (page - 1))
      .distinct()
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

    const [
      allTags,
      allFavorites,
      allVisibleUsers,
      allHistories,
      mylistStats,
      workbookStats,
    ] = await Promise.all([
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

      // 履歴（判定）を一括取得
      client
        .selectFrom("histories")
        .select(["quiz_id", "judgement"])
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

    const categories = new Map();
    await Promise.all(
      categoryIds.map(async (id) => {
        categories.set(id, await this.categoryInfra.findChainById(id));
      }),
    );
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
        isPublic: !allVisibleUsers.some((vu) => vu.quiz_id === q.id),
        isFavorite: allFavorites.some((f) => f.quiz_id === q.id),
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
        tags: allTags
          .filter((t) => t.quiz_id === q.id)
          .map((t) => ({
            label: t.label,
            created: t.created,
            modified: t.modified,
          })),
        registerdMylist: allMylists
          .filter((m) => m.quiz_id === q.id)
          .map((m) => {
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
        judgement: allHistories.find((h) => h.quiz_id === q.id)?.judgement,
        category: categories.get(q.categoryId) || [],
      };
    });
  }

  async count(uid: string, option: countOption = {}): Promise<number> {
    const client = this.clientManager.getClient();

    const userId = await client
      .selectFrom("users")
      .select("id")
      .where("uid", "=", uid)
      .executeTakeFirstOrThrow()
      .then((u) => u.id);

    let query = client
      .selectFrom("quizzes")
      .leftJoin("workbooks", "quizzes.workbook_id", "workbooks.id")
      .leftJoin("levels", "workbooks.level_id", "levels.id")
      .innerJoin("users", "users.id", "quizzes.creator_id")
      .leftJoin(
        "quiz_visible_users",
        "quiz_visible_users.quiz_id",
        "quizzes.id",
      )
      .select(({ fn }) => [fn.countAll<number>().over().as("size")])
      .where(({ eb, or }) =>
        or([
          eb("quiz_visible_users.user_id", "is", null),
          eb("quiz_visible_users.user_id", "=", userId),
        ]),
      );

    if (!!option.wids && option.wids.length)
      if (Array.isArray(option.wids))
        query = query.where("workbooks.wid", "in", option.wids);
      else query = query.where("workbooks.wid", "=", option.wids);
    if (!!option.keyword && !!option.keywordOption) {
      if (option.keywordOption === 1) {
        query = query.where((eb) =>
          eb.or([
            eb("quizzes.que", "like", `%${option.keyword}%`),
            eb("quizzes.ans", "like", `%${option.keyword}%`),
          ]),
        );
      } else if (option.keywordOption === 2) {
        query = query.where("quizzes.que", "like", `%${option.keyword}%`);
      } else {
        query = query.where("quizzes.ans", "like", `%${option.keyword}%`);
      }
    }
    if (!!option.categories) {
      if (Array.isArray(option.categories) && option.categories.length)
        query = query.where("quizzes.category_id", "in", option.categories);
      else query = query.where("quizzes.category_id", "=", option.categories);
    }
    if (!!option.tags) {
      if (Array.isArray(option.tags) && option.tags.length) {
        query = query
          .innerJoin("tagging", "tagging.quiz_id", "quizzes.id")
          .innerJoin("tags", "tagging.tag_id", "tags.id")
          .where("tags.label", "in", option.tags);
      } else {
        query = query
          .innerJoin("tagging", "tagging.quiz_id", "quizzes.id")
          .innerJoin("tags", "tagging.tag_id", "tags.id")
          .where("tags.label", "=", option.tags);
      }
    }
    // if (!!crctAnsRatio) {
    //   query = query.where(sql`quiz.total_crct_ans / (quiz.total_crct_ans + quiz.total_wrng_ans + quiz.total_through_ans) * 100 BETWEEN ${crctAnsRatio[0]} AND ${crctAnsRatio[1]}`)
    // }

    if (option.isFavorite) {
      query = query
        .innerJoin("favorites", "favorites.quiz_id", "quizzes.id")
        .where("favorites.user_id", "=", userId);
    } else if (!!option.since && !!option.until) {
      const since = dayjs(option.since).toDate();
      const until = dayjs(option.until).toDate();

      query = query
        .innerJoin("histories", "histories.quiz_id", "quizzes.id")
        .select([
          "histories.judgement as judgement",
          "histories.practiced as practiced",
        ])
        .where("histories.user_id", "=", userId)
        .where(({ eb, and, between }) =>
          !!option.judgements
            ? and([
                eb("histories.judgement", "in", option.judgements),
                between("histories.practiced", since, until),
              ])
            : between("histories.practiced", since, until),
        )
        .orderBy("histories.practiced desc");
    } else if (!!option.mid) {
      query = query
        .innerJoin("mylists_quizzes", "mylists_quizzes.quiz_id", "quizzes.id")
        .innerJoin("mylists", "mylists.id", "mylists_quizzes.mylist_id")
        .where("mylists.mid", "=", option.mid)
        .where("mylists.user_id", "=", userId)
        .orderBy("mylists_quizzes.registered desc");
    }

    const quizzes = await query.execute();

    return !!quizzes.length ? quizzes[0].size : 0;
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
      .executeTakeFirstOrThrow();

    return Quiz.reconstruct(
      quiz.qid,
      quiz.question,
      quiz.answer,
      quiz.total,
      quiz.right || 0,
      quiz.creatorUid,
      quiz.anotherAnswer,
      quiz.wid,
      quiz.categoryId,
    );
  }

  async save(quiz: Quiz): Promise<void> {
    const client = this.clientManager.getClient();

    const [workbookId, userId] = await Promise.all([
      client
        .selectFrom("workbooks")
        .select("id")
        .where("wid", "=", quiz.wid)
        .executeTakeFirst()
        .then((w) => w?.id),

      client
        .selectFrom("users")
        .select("id")
        .where("uid", "=", quiz.creatorUid)
        .executeTakeFirstOrThrow()
        .then((u) => u.id),
    ]);

    await client
      .insertInto("quizzes")
      .values({
        qid: quiz.qid,
        que: quiz.question,
        ans: quiz.answer,
        anoans: quiz.anotherAnswer,
        workbook_id: workbookId || null,
        creator_id: userId,
        category_id: quiz.categoryId,
      })
      .execute();
  }

  async update(quiz: Quiz): Promise<void> {
    const client = this.clientManager.getClient();

    const [workbookId, userId] = await Promise.all([
      client
        .selectFrom("workbooks")
        .select("id")
        .where("wid", "=", quiz.wid)
        .executeTakeFirst()
        .then((w) => w?.id),

      client
        .selectFrom("users")
        .select("id")
        .where("uid", "=", quiz.creatorUid)
        .executeTakeFirstOrThrow()
        .then((u) => u.id),
    ]);

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
