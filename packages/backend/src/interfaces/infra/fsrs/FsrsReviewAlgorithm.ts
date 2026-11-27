import type IReviewAlgorithm from "@/domains/UserQuizState/IReviewAlgorithm.js";
import type {
  ReviewJudgement,
  ReviewSnapshot,
  ScheduledReview,
} from "@/domains/UserQuizState/IReviewAlgorithm.js";
import dayjs from "@/plugins/day.js";
import { createEmptyCard, fsrs, Rating, type Card } from "ts-fsrs";
import {
  decodeFsrsMemory,
  encodeFsrsMemory,
  FSRS_PROFILE_VERSION,
} from "./FsrsMemoryCodec.js";

function createScheduler(desiredRetention?: number) {
  return fsrs({
    ...(desiredRetention === undefined
      ? {}
      : { request_retention: desiredRetention }),
    enable_fuzz: false,
    enable_short_term: true,
    learning_steps: ["1m"],
    relearning_steps: ["1m"],
  });
}

function toCard(previous: ReviewSnapshot, now: Date): Card {
  if (previous.memory === null) {
    if (previous.lastReviewedAt !== null || previous.reviewCount !== 0) {
      throw new Error("Existing review history must be migrated to FSRS");
    }
    return createEmptyCard(dayjs(now).toDate());
  }
  const memory = encodeFsrsMemory(previous.memory);
  if (
    previous.lastReviewedAt === null ||
    previous.nextReviewAt === null ||
    previous.reviewCount < 1
  ) {
    throw new Error("FSRS memory requires a previous review");
  }
  return {
    due: dayjs(previous.nextReviewAt).toDate(),
    last_review: dayjs(previous.lastReviewedAt).toDate(),
    stability: memory.stability,
    difficulty: memory.difficulty,
    state: memory.state,
    learning_steps: memory.learningSteps,
    reps: previous.reviewCount,
    lapses: memory.lapses,
    elapsed_days: memory.elapsedDays,
    scheduled_days: previous.intervalDays,
  };
}

export default class FsrsReviewAlgorithm implements IReviewAlgorithm {
  schedule(
    previous: ReviewSnapshot,
    judgement: ReviewJudgement,
    reviewedAt: Date,
    desiredRetention: number,
  ): ScheduledReview {
    const next = createScheduler(desiredRetention).next(
      toCard(previous, reviewedAt),
      dayjs(reviewedAt).toDate(),
      judgement === 1 ? Rating.Good : Rating.Again,
    ).card;
    if (!dayjs(next.due).isValid()) {
      throw new RangeError(
        "Next review time is outside the supported date range",
      );
    }
    return {
      memory: decodeFsrsMemory({
        version: FSRS_PROFILE_VERSION,
        stability: next.stability,
        difficulty: next.difficulty,
        state: next.state,
        learningSteps: next.learning_steps,
        lapses: next.lapses,
        elapsedDays: next.elapsed_days,
      }),
      reviewCount: next.reps,
      intervalDays: next.scheduled_days,
      lastReviewedAt: dayjs(reviewedAt).toDate(),
      nextReviewAt: dayjs(next.due).toDate(),
    };
  }

  retrievability(snapshot: ReviewSnapshot, at: Date): number {
    return createScheduler().get_retrievability(
      toCard(snapshot, at),
      at,
      false,
    );
  }
}
