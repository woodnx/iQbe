import { db } from "@/database";

export const findLevels = () => (
  db.selectFrom('levels')
  .selectAll()
  .execute()
)