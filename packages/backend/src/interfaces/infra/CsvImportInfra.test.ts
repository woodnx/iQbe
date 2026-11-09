import CsvImportInfra from "./CsvImportInfra.js";

const parse = (csv: string) => new CsvImportInfra().parseCsv(Buffer.from(csv));

describe("CsvImportInfra", () => {
  it.each(["question", "問題文", "問題"])(
    "recognizes question header %s",
    async (header) => {
      const [row] = await parse(`${header},answer\n問題,答え`);
      expect(row.question).toBe("問題");
    },
  );
  it.each(["answer", "答え", "解答", "回答", "正解"])(
    "recognizes answer header %s",
    async (header) => {
      const [row] = await parse(`question,${header}\n問題,答え`);
      expect(row.answer).toBe("答え");
    },
  );
  it.each([
    "anotherAnswer",
    "別解",
    "別解等",
    "別解・正誤判定基準",
    "正誤判定基準",
  ])("recognizes alternate answer header %s", async (header) => {
    const [row] = await parse(`問題,答え,${header}\n問題,答え,別解`);
    expect(row.anotherAnswer).toBe("別解");
  });
  it("preserves all alternate answers and judgement criteria", async () => {
    const [row] = await parse(
      '問題,答え,別解等,別解・正誤判定基準,正誤判定基準\nQ,A,別解,,"基準1\n基準2"',
    );
    expect(row.anotherAnswer).toBe("別解\n基準1\n基準2");
  });
  it("handles BOM, padded headers, quoted values and category names", async () => {
    const [row] = await parse(
      '\uFEFF 問題文 , 解答 , 大ジャンル , 小ジャンル \n"Q,1",A, 科学 , 数学 \n\n',
    );
    expect(row.question).toBe("Q,1");
    expect(row.anotherAnswer).toBeNull();
    expect(row.categoryName).toBe("科学");
    expect(row.subCategoryName).toBe("数学");
  });
  it.each(["category,subCategory", "categoryName,subCategoryName"])(
    "recognizes English category headers %s",
    async (headers) => {
      const [row] = await parse(`question,answer,${headers}\nQ,A,科学,数学`);
      expect(row.categoryName).toBe("科学");
      expect(row.subCategoryName).toBe("数学");
    },
  );
  it.each([
    "問題,別解等\nQ,A",
    "問題,question,答え\nQ,Q,A",
    "問題,答え,大ジャンル,category\nQ,A,X,Y",
  ])("rejects missing or ambiguous headers", async (csv) => {
    await expect(parse(csv)).rejects.toMatchObject({ status: 400 });
  });
});
