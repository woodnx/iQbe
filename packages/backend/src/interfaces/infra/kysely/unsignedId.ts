import { sql } from "kysely";

/**
 * BIGINT UNSIGNED の ID を SQL の値にする。number を経由しないのは、2^53 を超える
 * ID が丸められるため（束縛値は 10 進文字列のまま渡る）。
 */
export const toUnsignedId = (id: bigint) =>
  sql<number>`CAST(${id.toString()} AS UNSIGNED)`;
