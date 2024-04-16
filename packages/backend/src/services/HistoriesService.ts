import { db } from "@/database";
import { InsertHistory, countJudement, insertHistory } from "@/models/Histories";
import dayjs, { format } from "@/plugins/day";

type CountHistories = {
  userId: number,
  since: number,
  until: number,
}
type CreateHistory = Omit<InsertHistory, "practiced">

export const countHistories = ({
  userId,
  since,
  until,
}: CountHistories) => (
  Promise.all(
    [0, 1, 2].map((j) => (
      countJudement({
        judgement: j,
        userId,
        since: dayjs(since).toDate(),
        until: dayjs(until).toDate(),
      })
      .then((result) => {
        if (!result) return 0
        return Number(result.count);
      })
    ))
  )
);

export const createHistory = (data: CreateHistory) => {
  const practiced = format(dayjs().toDate());
  return db.transaction().execute(async (trx) => (
    insertHistory(trx, {
      ...data,
      practiced,
    })
  ));
}