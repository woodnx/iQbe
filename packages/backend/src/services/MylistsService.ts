import { Mylists } from "@/models/Mylitst";
import Hashids from 'hashids';
import dayjs, { format } from '@/plugins/day';
import { db } from "@/database";

const hashids = new Hashids(process.env.HASHIDS_SALT, 10, process.env.HASHIDS_ALPHABET);

export const MylistsService =  {
  async findOwn(userId: number) {
    const _mylists = await Mylists.own(userId);

    const mylists = await Promise.all(_mylists.map(async ({ id, name, created })=>{
      const mid = hashids.encode(id);
      await Mylists.update(id, { mid });

      return {
        name,
        mid,
        created: format(created),
      }
    }));
    return mylists;
  },

  async create(name: string, userId: number) {
    const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const mid = await Mylists.generateMid();

    const data = {
      user_id: userId,
      name,
      created: now,
      attr: 100,
      mid,
    };

    await Mylists.create(data);

    return {
      mid,
      name,
      created: now,
    };
  },

  async update(mid: string, newName: string) {
    await db.updateTable('mylists')
    .set({
      name: newName
    })
    .where('mid', '=', mid)
    .execute();

    const updated = await db.selectFrom('mylists')
    .select('created')
    .where('mid', '=', mid)
    .executeTakeFirstOrThrow();

    return {
      mid,
      name: newName,
      created: format(updated.created),
    }
  },

  async delete(mid: string) {
    await db.deleteFrom('mylists')
    .where('mid', '=', mid)
    .execute();
  }
}