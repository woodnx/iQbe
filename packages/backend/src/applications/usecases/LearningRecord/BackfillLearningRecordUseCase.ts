import ReviewService from "@/applications/services/ReviewService.js";
import ITransactionManager from "@/applications/shared/ITransactionManager.js";
import { isMissingParentError } from "@/applications/shared/isMissingParentError.js";
import type {
  default as IHistoryRepository,
  StudyDayAssignment,
} from "@/domains/History/IHistoryRepository.js";
import { placeOnStudyDays } from "@/domains/History/index.js";
import type History from "@/domains/History/index.js";
import IUserQuizStateRepository from "@/domains/UserQuizState/IUserQuizStateRepository.js";
import UserQuizState from "@/domains/UserQuizState/index.js";

export type BackfillLearningRecordCommand = Readonly<{
  uid: string;
  qid: string;
  /** false のときは何も書かず、書く予定の内容だけを返す。 */
  shouldApply: boolean;
}>;

export type BackfillLearningRecordReport = Readonly<{
  uid: string;
  qid: string;
  isStateRebuilt: boolean;
  assignedStudyDayCount: number;
  isDeletedPair: boolean;
}>;

/** histories は古い順。学習日の入っていない行だけに、日本時間の暦日ごとの通し番号を割り当てる。 */
function planStudyDayAssignments(
  histories: readonly History[],
): StudyDayAssignment[] {
  const placements = placeOnStudyDays(
    histories.map((history) => history.practicedAt),
  );
  return histories.flatMap((history, index) => {
    if (history.studyDayPlacement !== null) return [];
    if (history.id === null) throw new Error("Saved history has no id");
    return [{ historyId: history.id, ...placements[index] }];
  });
}

/** 既存の解答履歴から、1 組分の習熟状態と学習日を作る。解答 API と同じロックと規則を使う。 */
export default class BackfillLearningRecordUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private historyRepository: IHistoryRepository,
    private userQuizStateRepository: IUserQuizStateRepository,
    private reviewService: ReviewService,
  ) {}

  async execute(
    command: BackfillLearningRecordCommand,
  ): Promise<BackfillLearningRecordReport> {
    try {
      return await this.transactionManager.begin(
        () => this.backfillPair(command),
        // 書き込みはロック待ちの後に最新の履歴を読むため READ COMMITTED。読み取り専用の
        // 確認は、状態と履歴を同じ時点で比べるため REPEATABLE READ。
        {
          isolationLevel: command.shouldApply
            ? "read committed"
            : "repeatable read",
        },
      );
    } catch (error) {
      if (!isMissingParentError(error)) throw error;
      // 失敗したトランザクションをロールバックしてから、削除確定後の履歴を読み直す。
      const histories = await this.historyRepository.listByUidAndQid(
        command.uid,
        command.qid,
      );
      if (histories.length > 0) throw error;
      return this.reportDeletedPair(command);
    }
  }

  private async backfillPair(
    command: BackfillLearningRecordCommand,
  ): Promise<BackfillLearningRecordReport> {
    const { uid, qid, shouldApply } = command;
    const saved = shouldApply
      ? await this.userQuizStateRepository.findOrCreateForUpdate(uid, qid)
      : await this.userQuizStateRepository.findByUidAndQid(uid, qid);
    const histories = await this.historyRepository.listByUidAndQid(uid, qid);
    // 組は履歴から列挙するので、0 件になるのは列挙後に親レコードが削除された場合だけ。
    if (histories.length === 0) return this.reportDeletedPair(command);

    // 状態行の無い読み取り専用の確認でも再生を実行し、不正な判定値を --apply 前に検出する。
    const baseline = saved ?? UserQuizState.create(uid, qid);
    const resolved = this.reviewService.resolvePreviousState(
      baseline,
      histories,
    );
    const isStateRebuilt = saved === null || resolved !== baseline;
    const assignments = planStudyDayAssignments(histories);

    if (shouldApply) {
      if (isStateRebuilt) await this.userQuizStateRepository.save(resolved);
      await this.historyRepository.assignStudyDayPlacements(assignments);
    }

    return {
      uid,
      qid,
      isStateRebuilt,
      assignedStudyDayCount: assignments.length,
      isDeletedPair: false,
    };
  }

  private reportDeletedPair(
    command: BackfillLearningRecordCommand,
  ): BackfillLearningRecordReport {
    return {
      uid: command.uid,
      qid: command.qid,
      isStateRebuilt: false,
      assignedStudyDayCount: 0,
      isDeletedPair: true,
    };
  }
}
