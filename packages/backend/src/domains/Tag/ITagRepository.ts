import Tag from ".";

export default interface ITagRepository {
  findByLabel(label: string): Promise<Tag | null>,
  search(q?: string): Promise<Tag[]>,
  save(tag: Tag): Promise<void>,
  delete(label: string): Promise<void>,
}
