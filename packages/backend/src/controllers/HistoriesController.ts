import { countHistories } from "@/services/HistoriesService";
import { typedAsyncWrapper } from "@/utils";

export const getSinceUntil = typedAsyncWrapper<"/histories/{since}/{until}", "get">(async (req, res) => {
  const since = req.params.since;
  const until = req.params.until;
  const userId = req.userId;

  const results = await countHistories({
    userId,
    since,
    until,
  });
  const data = {
    right: results[1] || 0,
    wrong: results[0] || 0,
    through: results[2] || 0,
  };

  res.status(200).send(data);
});

export default {
  getSinceUntil,
}