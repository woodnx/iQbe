import Tag from "@/domains/Tag";
import ITagRepository from "@/domains/Tag/ITagRepository";

export class InMemoryTagInfra implements ITagRepository {
  public DB: {
    [label: string]: Tag;
  } = {};

  async findByLabel(label: string): Promise<Tag | null> {
    const tag = Object.values(this.DB).find((tag) => tag.label === label);
    return tag || null;
  }

  async search(q?: string, all?: boolean): Promise<Tag[]> {
    if (all) {
      return Object.values(this.DB);
    }
    return Object.values(this.DB).filter((tag) =>
      tag.label.toLowerCase().includes(q?.toLowerCase() || ""),
    );
  }

  async save(tag: Tag): Promise<void> {
    this.DB[tag.label] = tag;
  }

  async delete(label: string): Promise<void> {
    delete this.DB[label];
  }
}
