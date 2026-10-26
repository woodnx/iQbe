import { sql } from "kysely";
import { db } from "../database.js";

// Read-only preflight. Never generate replacement IDs for existing records.
try {
  let invalid = false;
  for (const [table, column] of [
    ["quizzes", "qid"],
    ["workbooks", "wid"],
    ["mylists", "mid"],
  ] as const) {
    const missing = await db
      .selectFrom(table)
      .select(({ fn }) => fn.countAll<number>().as("count"))
      .where(
        sql<boolean>`TRIM(${sql.ref(column)}) = '' OR ${sql.ref(column)} IS NULL`,
      )
      .executeTakeFirstOrThrow();
    const duplicates = await db
      .selectFrom(table)
      .select(column)
      .groupBy(column)
      .having(({ fn }) => fn.countAll(), ">", 1)
      .execute();
    console.log(
      JSON.stringify({
        table,
        column,
        emptyIds: Number(missing.count),
        duplicateGroups: duplicates.length,
      }),
    );
    invalid ||= Number(missing.count) > 0 || duplicates.length > 0;
  }
  const indexes = await sql`SELECT TABLE_NAME, INDEX_NAME, NON_UNIQUE,
    GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns_list
    FROM information_schema.STATISTICS WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME IN ('quizzes', 'workbooks', 'mylists', 'histories')
    GROUP BY TABLE_NAME, INDEX_NAME, NON_UNIQUE ORDER BY TABLE_NAME, INDEX_NAME`.execute(
    db,
  );
  console.log(JSON.stringify(indexes.rows, null, 2));
  if (invalid)
    throw new Error(
      "Index preflight failed: repair empty/duplicate IDs before migration; no IDs were changed.",
    );
} finally {
  await db.destroy();
}
