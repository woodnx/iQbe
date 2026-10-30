import { z } from "zod";

export const postCsvParse = {
  form: z.object({ file: z.instanceof(File).optional() }),
};
