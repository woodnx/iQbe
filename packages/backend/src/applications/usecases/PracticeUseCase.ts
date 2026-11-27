import ITransactionManager from "../shared/ITransactionManager.js";
import ReviewService from "../services/ReviewService.js";
import { isMissingParentError } from "../shared/isMissingParentError.js";
import IGrowthEventRepository from "@/domains/GrowthEvent/IGrowthEventRepository.js";
import GrowthEvent, {
  type GrowthEventType,
} from "@/domains/GrowthEvent/index.js";
import DuplicateClientAttemptError from "@/domains/History/DuplicateClientAttemptError.js";
import IHistoryRepository from "@/domains/History/IHistoryRepository.js";
import History, { placeOnStudyDays } from "@/domains/History/index.js";
import IQuizRepository from "@/domains/Quiz/IQuizRepository.js";
import IUserQuizStateRepository from "@/domains/UserQuizState/IUserQuizStateRepository.js";
import {
  CURRENT_REVIEW_SETTINGS_VERSION,
  toReviewJudgement,
} from "@/domains/UserQuizState/ReviewScheduler.js";
import type { QuizLearningState } from "@/domains/UserQuizState/index.js";

export type PracticeAttemptResult = {
  /** histories.id の 10 進文字列。 */
  attemptId: string;
  qid: string;
  judgement: number;
  /** サーバーが確定した解答時刻（ISO 8601、UTC）。 */
  practicedAt: string;
  /** FSRS 接続前に保存された解答の再送では null。 */
  outcome: {
    previousJudgement: number | null;
    review: { state: QuizLearningState; nextReviewAt: string };
    growthEvents: GrowthEventType[];
    studyDate: string;
    dailyAttemptNumber: number;
  } | null;
};

type PracticeErrorCode = "CLIENT_ATTEMPT_ID_CONFLICT" | "QUIZ_NOT_FOUND";
type AddPracticeResult =
  | { ok: true; data: PracticeAttemptResult }
  | { ok: false; error: { code: PracticeErrorCode; message: string } };

const CORRECT = 1;

const QUIZ_NOT_FOUND = {
  ok: false,
  error: { code: "QUIZ_NOT_FOUND", message: "指定された問題が見つかりません" },
} as const satisfies AddPracticeResult;

const CLIENT_ATTEMPT_ID_CONFLICT = {
  ok: false,
  error: {
    code: "CLIENT_ATTEMPT_ID_CONFLICT",
    message: "同じ clientAttemptId で異なる解答が登録されています",
  },
} as const satisfies AddPracticeResult;

const laterOf = (instant: Date, other: Date | null) =>
  other !== null && other.getTime() > instant.getTime() ? other : instant;

function toPracticeAttemptResult(
  historyId: bigint,
  history: History,
  growthEvents: GrowthEventType[],
): PracticeAttemptResult {
  const outcome = history.reviewOutcome;
  const placement = history.studyDayPlacement;
  return {
    attemptId: String(historyId),
    qid: history.qid,
    judgement: history.judgement,
    practicedAt: history.practicedAt.toISOString(),
    outcome:
      outcome && placement
        ? {
            previousJudgement: outcome.previousJudgement,
            review: {
              state: outcome.reviewState,
              nextReviewAt: outcome.nextReviewAt.toISOString(),
            },
            growthEvents,
            studyDate: placement.studyDate,
            dailyAttemptNumber: placement.dailyAttemptNumber,
          }
        : null,
  };
}

export default class PracticeUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private quizRepository: IQuizRepository,
    private historyRepository: IHistoryRepository,
    private userQuizStateRepository: IUserQuizStateRepository,
    private growthEventRepository: IGrowthEventRepository,
    private reviewService: ReviewService,
  ) {}

  async addPractice(
    uid: string,
    qid: string,
    judgement: number,
    pressedWordPosition: number,
    clientAttemptId: string,
  ): Promise<AddPracticeResult> {
    const requested = new History(
      qid,
      uid,
      pressedWordPosition,
      judgement,
      new Date(),
      clientAttemptId,
      null,
      "FREE",
    );

    const savedResult = await this.findSavedAttemptResult(requested);
    if (savedResult) return savedResult;

    const canonicalRequest = await this.resolveCanonicalRequest(requested);
    if (!canonicalRequest) return QUIZ_NOT_FOUND;

    try {
      const confirmed = await this.transactionManager.begin(
        () => this.recordNewAttempt(canonicalRequest),
        // 既定の REPEATABLE READ だと、ロック待ちの前に読んだスナップショットを使い続け、
        // 先に確定した解答が見えない
        // （https://dev.mysql.com/doc/refman/9.1/en/innodb-transaction-isolation-levels.html ）。
        { isolationLevel: "read committed" },
      );
      return { ok: true, data: confirmed };
    } catch (error) {
      if (error instanceof DuplicateClientAttemptError) {
        // 同じ clientAttemptId の同時送信に負けた。勝った側は確定済みなので読み直す。
        const winner = await this.findSavedAttemptResult(canonicalRequest);
        if (winner) return winner;
        // 勝者の確定後に問題が削除されると、履歴も連鎖削除される。
        if (!(await this.quizRepository.findByQid(qid))) return QUIZ_NOT_FOUND;
        throw error.cause;
      }
      // 問題が存在確認の後に削除された場合だけ 404 にする。他の DB エラーは隠さない。
      if (
        isMissingParentError(error) &&
        !(await this.quizRepository.findByQid(qid))
      ) {
        return QUIZ_NOT_FOUND;
      }
      throw error;
    }
  }

  private async resolveCanonicalRequest(
    requested: History,
  ): Promise<History | null> {
    const quiz = await this.quizRepository.findByQid(requested.qid);
    if (!quiz) return null;
    return new History(
      quiz.qid,
      requested.uid,
      requested.pressedWordPosition,
      requested.judgement,
      requested.practicedAt,
      requested.clientAttemptId,
      null,
      requested.mode,
    );
  }

  private async findSavedAttemptResult(
    requested: History,
  ): Promise<AddPracticeResult | null> {
    const clientAttemptId = requested.clientAttemptId;
    if (clientAttemptId === null) {
      throw new Error("Requested attempt has no clientAttemptId");
    }
    return this.transactionManager.begin(
      async () => {
        const saved = await this.historyRepository.findByClientAttemptId(
          requested.uid,
          clientAttemptId,
        );
        if (!saved) return null;
        const canonicalRequest = await this.resolveCanonicalRequest(requested);
        return this.replaySavedAttempt(saved, canonicalRequest ?? requested);
      },
      { isolationLevel: "repeatable read" },
    );
  }

  private async recordNewAttempt(
    requested: History,
  ): Promise<PracticeAttemptResult> {
    const { uid, qid, judgement } = requested;
    const savedState = await this.userQuizStateRepository.findOrCreateForUpdate(
      uid,
      qid,
    );
    const pastAttempts = await this.historyRepository.listByUidAndQid(uid, qid);
    const previousState = this.reviewService.resolvePreviousState(
      savedState,
      pastAttempts,
    );

    // 時刻をロック取得後に読むのは、確定時刻の順序を処理順と一致させるため。
    const nextState = this.reviewService.scheduleReview(
      previousState,
      toReviewJudgement(judgement),
      laterOf(new Date(), previousState.lastReviewedAt),
    );
    const { lastReviewedAt: practicedAt, nextReviewAt } = nextState;
    if (practicedAt === null || nextReviewAt === null) {
      throw new Error("Scheduled review has no time");
    }

    // 過去の解答と並べて番号を振り、既存履歴の移行と同じ規則にする。
    const placement = placeOnStudyDays([
      ...pastAttempts.map((pastAttempt) => pastAttempt.practicedAt),
      practicedAt,
    ]).at(-1);
    if (placement === undefined) throw new Error("Attempt has no study day");
    const previousJudgement = pastAttempts.at(-1)?.judgement ?? null;

    const confirmed = new History(
      qid,
      uid,
      requested.pressedWordPosition,
      judgement,
      practicedAt,
      requested.clientAttemptId,
      null,
      requested.mode,
      placement,
      {
        previousJudgement,
        reviewState: nextState.state,
        nextReviewAt,
        reviewSettingsVersion: CURRENT_REVIEW_SETTINGS_VERSION,
      },
    );
    const historyId = await this.historyRepository.add(confirmed);
    await this.userQuizStateRepository.save(nextState);
    const growthEvents = GrowthEvent.detect(
      {
        judgement,
        previousJudgement,
        hasCorrectAnswerBefore: pastAttempts.some(
          (pastAttempt) => pastAttempt.judgement === CORRECT,
        ),
        previousDueAt: previousState.nextReviewAt,
        answeredAt: practicedAt,
      },
      historyId,
    );
    await this.growthEventRepository.insertAll(growthEvents);

    return toPracticeAttemptResult(
      historyId,
      confirmed,
      growthEvents.map((event) => event.type),
    );
  }

  private async replaySavedAttempt(
    saved: History,
    requested: History,
  ): Promise<AddPracticeResult> {
    if (!saved.hasSameAnswer(requested)) return CLIENT_ATTEMPT_ID_CONFLICT;
    if (saved.id === null) throw new Error("Saved history has no id");
    const growthEvents = saved.reviewOutcome
      ? await this.growthEventRepository.listTypesByHistoryId(saved.id)
      : [];
    return {
      ok: true,
      data: toPracticeAttemptResult(saved.id, saved, growthEvents),
    };
  }
}
