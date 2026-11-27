import { NoResultError, sql } from "kysely";
import DuplicateClientAttemptError from "@/domains/History/DuplicateClientAttemptError.js";
import IHistoryRepository from "@/domains/History/IHistoryRepository.js";
import type {
  AnsweredPair,
  StudyDayAssignment,
} from "@/domains/History/IHistoryRepository.js";
import History from "@/domains/History/index.js";
import type { PracticeMode } from "@/domains/History/index.js";
import type { QuizLearningState } from "@/domains/UserQuizState/index.js";
import KyselyClientManager from "./kysely/KyselyClientManager.js";
import { toUnsignedId } from "./kysely/unsignedId.js";

type HistoryRow = {
  history_id_text: string;
  client_attempt_id: string | null;
  qid: string;
  uid: string;
  judgement: number;
  pressed_word: number | null;
  practiced: Date;
  practice_mode: PracticeMode | null;
  study_date: string | null;
  daily_attempt_number: number | null;
  previous_judgement: number | null;
  review_state: QuizLearningState | null;
  next_review_at: Date | null;
  review_settings_version: number | null;
};

const toHistory = (row: HistoryRow): History =>
  new History(
    row.qid,
    row.uid,
    row.pressed_word,
    row.judgement,
    row.practiced,
    row.client_attempt_id,
    BigInt(row.history_id_text),
    row.practice_mode,
    row.study_date !== null && row.daily_attempt_number !== null
      ? {
          studyDate: row.study_date,
          dailyAttemptNumber: row.daily_attempt_number,
        }
      : null,
    row.practice_mode !== null &&
      row.review_state !== null &&
      row.next_review_at !== null &&
      row.review_settings_version !== null
      ? {
          previousJudgement: row.previous_judgement,
          reviewState: row.review_state,
          nextReviewAt: row.next_review_at,
          reviewSettingsVersion: row.review_settings_version,
        }
      : null,
  );

export default class HistoryInfra implements IHistoryRepository {
  constructor(private clientManager: KyselyClientManager) {}

  async getAllDates(uid: string): Promise<Date[]> {
    const client = this.clientManager.getClient();

    const histories = await client
      .selectFrom("histories")
      .innerJoin("users", "histories.user_id", "users.id")
      .select(["histories.practiced"])
      .groupBy("histories.practiced")
      .orderBy("histories.practiced", "desc")
      .where("users.uid", "=", uid)
      .execute()
      .then((result) => result.map((r) => r.practiced));

    return histories;
  }

  private selectHistories() {
    return this.clientManager
      .getClient()
      .selectFrom("histories")
      .innerJoin("users", "histories.user_id", "users.id")
      .innerJoin("quizzes", "histories.quiz_id", "quizzes.id")
      .select([
        // mysql2 が BIGINT を number へ丸める経路を避けるため、文字列で受ける。
        sql<string>`CAST(histories.id AS CHAR)`.as("history_id_text"),
        "histories.client_attempt_id",
        "quizzes.qid",
        "users.uid",
        "histories.judgement",
        "histories.pressed_word",
        "histories.practiced",
        "histories.practice_mode",
        // DATE をそのまま読むと、mysql2 がプロセスのタイムゾーンの 0 時として Date にする。
        sql<string | null>`DATE_FORMAT(histories.study_date, '%Y-%m-%d')`.as(
          "study_date",
        ),
        "histories.daily_attempt_number",
        "histories.previous_judgement",
        "histories.review_state",
        "histories.next_review_at",
        "histories.review_settings_version",
      ]);
  }

  async findByClientAttemptId(
    uid: string,
    clientAttemptId: string,
  ): Promise<History | null> {
    const row = await this.selectHistories()
      .where("histories.client_attempt_id", "=", clientAttemptId)
      .where("users.uid", "=", uid)
      .executeTakeFirst();

    return row ? toHistory(row) : null;
  }

  async listByUidAndQid(uid: string, qid: string): Promise<History[]> {
    const rows = await this.selectHistories()
      .where("users.uid", "=", uid)
      .where("quizzes.qid", "=", qid)
      .orderBy("histories.practiced")
      .orderBy("histories.id")
      .execute();

    return rows.map(toHistory);
  }

  async add(history: History): Promise<bigint> {
    const client = this.clientManager.getClient();
    const placement = history.studyDayPlacement;
    const outcome = history.reviewOutcome;
    // user_id・quiz_id を別の検索で求めず、同じ文で uid・qid から引く。
    const query = client
      .insertInto("histories")
      .columns([
        "user_id",
        "quiz_id",
        "practiced",
        "judgement",
        "pressed_word",
        "client_attempt_id",
        "practice_mode",
        "study_date",
        "daily_attempt_number",
        "previous_judgement",
        "review_state",
        "next_review_at",
        "review_settings_version",
      ])
      .expression(
        client
          .selectFrom("users")
          .innerJoin("quizzes", (join) => join.onTrue())
          .select((eb) => [
            "users.id as user_id",
            "quizzes.id as quiz_id",
            eb.val(history.practicedAt).as("practiced"),
            eb.val(history.judgement).as("judgement"),
            eb.val(history.pressedWordPosition).as("pressed_word"),
            eb.val(history.clientAttemptId).as("client_attempt_id"),
            eb.val(history.mode).as("practice_mode"),
            // DATE 列へは暦日の文字列のまま渡す（Date にすると接続のタイムゾーンで日付がずれ得る）。
            eb.val(placement?.studyDate ?? null).as("study_date"),
            eb
              .val(placement?.dailyAttemptNumber ?? null)
              .as("daily_attempt_number"),
            eb.val(outcome?.previousJudgement ?? null).as("previous_judgement"),
            eb.val(outcome?.reviewState ?? null).as("review_state"),
            eb.val(outcome?.nextReviewAt ?? null).as("next_review_at"),
            eb
              .val(outcome?.reviewSettingsVersion ?? null)
              .as("review_settings_version"),
          ])
          .where("users.uid", "=", history.uid)
          .where("quizzes.qid", "=", history.qid),
      );
    try {
      const insertResult = await query.executeTakeFirstOrThrow();
      // ユーザーか問題が無いと SELECT が 0 行になり、何も保存されない。従来の ID 検索と
      // 同じ NoResultError にし、呼び出し側の「削除された親」の判定を変えない。
      if (insertResult.numInsertedOrUpdatedRows !== 1n) {
        throw new NoResultError(query.toOperationNode());
      }
      if (insertResult.insertId === undefined) {
        throw new Error("Inserted history has no id");
      }
      return insertResult.insertId;
    } catch (error) {
      const isDuplicateKey =
        error instanceof Error &&
        "code" in error &&
        error.code === "ER_DUP_ENTRY";
      // 旧形式の履歴（clientAttemptId が null）は再送の識別に使えないので、変換しない。
      if (!isDuplicateKey || history.clientAttemptId === null) throw error;
      // どの一意制約に当たったかをメッセージ文字列で見分けない。呼び出し側が
      // clientAttemptId で読み直し、見つからなければ cause を投げ直す。
      throw new DuplicateClientAttemptError(error);
    }
  }

  async assignStudyDayPlacements(
    assignments: readonly StudyDayAssignment[],
  ): Promise<void> {
    const client = this.clientManager.getClient();
    for (const assignment of assignments) {
      await client
        .updateTable("histories")
        .set({
          study_date: assignment.studyDate,
          daily_attempt_number: assignment.dailyAttemptNumber,
        })
        .where("id", "=", toUnsignedId(assignment.historyId))
        .where("daily_attempt_number", "is", null)
        .execute();
    }
  }

  async listAnsweredPairs(
    after: AnsweredPair | null,
    limit: number,
  ): Promise<AnsweredPair[]> {
    let query = this.clientManager
      .getClient()
      .selectFrom("histories")
      .innerJoin("users", "histories.user_id", "users.id")
      .innerJoin("quizzes", "histories.quiz_id", "quizzes.id")
      .select(["users.uid", "quizzes.qid"])
      .distinct();
    if (after !== null) {
      query = query.where((eb) =>
        eb.or([
          eb("users.uid", ">", after.uid),
          eb.and([
            eb("users.uid", "=", after.uid),
            eb("quizzes.qid", ">", after.qid),
          ]),
        ]),
      );
    }
    return query
      .orderBy("users.uid")
      .orderBy("quizzes.qid")
      .limit(limit)
      .execute();
  }
}
