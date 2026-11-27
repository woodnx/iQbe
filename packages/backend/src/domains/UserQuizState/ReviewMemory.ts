/** アプリで扱う学習段階。外部ライブラリの数値状態から独立させる。 */
export type ReviewPhase = "learning" | "review" | "relearning";

/** 記憶モデルの状態。profileは計算方式と設定を識別する不透明な識別子。 */
export type ReviewMemory = Readonly<{
  profile: string;
  stability: number;
  difficulty: number;
  phase: ReviewPhase;
  learningStep: number;
  lapses: number;
  elapsedDays: number;
}>;
