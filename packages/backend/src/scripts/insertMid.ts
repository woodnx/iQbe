import { db } from "@/database";
import MylistService from "@/domains/Mylist/MylistService";

const mylistService = new MylistService();

(async () => {
  const mylists = await db.selectFrom('mylists').select('id').execute();

  for (const mylist of mylists) {
    const mid = mylistService.genereateMid();

    await db.updateTable('mylists')
    .set({
      mid,
    })
    .where('id', '=', mylist.id)
    .execute();

    console.log('inserted ', mid);
  }
})();
