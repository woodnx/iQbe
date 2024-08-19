import Tag from ".";

export default interface ITagRepository {
  findByTid(tid: string): Promise<Tag | null>,
  findOwn(uid: string): Promise<Tag[]>,
  save(tag: Tag): Promise<void>,
  update(tag: Tag): Promise<void>,
  delete(tid: string): Promise<void>,
}
