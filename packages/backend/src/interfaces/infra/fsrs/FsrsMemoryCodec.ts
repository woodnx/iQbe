import type {
  ReviewMemory,
  ReviewPhase,
} from "@/domains/UserQuizState/ReviewMemory.js";
import { State } from "ts-fsrs";
import { z } from "zod";

// ts-fsrs 5.4.2 / FSRS-6 の既定の重みと今回の学習設定を識別する。
export const FSRS_PROFILE_VERSION = "fsrs6-v1";

// 既存fsrs_memoryのJSON形式を維持する。ドメインの表現とはここで変換する。
const fsrsMemorySchema = z
  .object({
    version: z.literal(FSRS_PROFILE_VERSION),
    stability: z.number().finite().positive(),
    difficulty: z.number().min(1).max(10),
    state: z.union([
      z.literal(State.Learning),
      z.literal(State.Review),
      z.literal(State.Relearning),
    ]),
    learningSteps: z.number().int().nonnegative(),
    lapses: z.number().int().nonnegative(),
    elapsedDays: z.number().int().nonnegative(),
  })
  .strict();

const phaseByState = {
  [State.Learning]: "learning",
  [State.Review]: "review",
  [State.Relearning]: "relearning",
} as const;
const stateByPhase = {
  learning: State.Learning,
  review: State.Review,
  relearning: State.Relearning,
} satisfies Record<ReviewPhase, State>;

export function decodeFsrsMemory(value: unknown): ReviewMemory {
  const memory = fsrsMemorySchema.parse(value);
  return {
    profile: memory.version,
    stability: memory.stability,
    difficulty: memory.difficulty,
    phase: phaseByState[memory.state],
    learningStep: memory.learningSteps,
    lapses: memory.lapses,
    elapsedDays: memory.elapsedDays,
  };
}

export function encodeFsrsMemory(memory: ReviewMemory) {
  return fsrsMemorySchema.parse({
    version: memory.profile,
    stability: memory.stability,
    difficulty: memory.difficulty,
    state: stateByPhase[memory.phase],
    learningSteps: memory.learningStep,
    lapses: memory.lapses,
    elapsedDays: memory.elapsedDays,
  });
}

export function deserializeFsrsMemory(value: unknown): ReviewMemory | null {
  if (value === null) return null;
  return decodeFsrsMemory(
    typeof value === "string" ? JSON.parse(value) : value,
  );
}

export function serializeFsrsMemory(
  memory: ReviewMemory | null,
): string | null {
  return memory === null ? null : JSON.stringify(encodeFsrsMemory(memory));
}
