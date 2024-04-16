import { findLevels } from "@/models/Levels";
import { typedAsyncWrapper } from "@/utils";

const get = typedAsyncWrapper<"/levels", "get">(async (req, res) => {
  const levels = await findLevels();
  res.status(200).send(levels);
});

export default {
  get,
}