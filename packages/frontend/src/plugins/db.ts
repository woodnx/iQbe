import { QuizSearch } from "@/routes/_schemas/quizSearch";
import Dexie, { EntityTable } from "dexie";

type PracticeSession = QuizSearch & {
  id: number;
  quizIds: string[];
  currentIndex: number;
  updatedAt: Date;
};

export const db = new Dexie("iQbe") as Dexie & {
  practiceSessions: EntityTable<PracticeSession, "id">;
};

db.version(1).stores({
  practiceSessions: "++id, updatedAt",
});
