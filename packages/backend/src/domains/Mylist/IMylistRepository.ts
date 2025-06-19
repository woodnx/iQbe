import Mylist from ".";

export default interface IMylistRepository {
  findByMid(mid: string): Promise<Mylist | null>;
  findManyByCreatorUid(uid: string): Promise<Mylist[]>;
  save(mylist: Mylist): Promise<void>;
  update(mylist: Mylist): Promise<void>;
  delete(mylist: Mylist): Promise<void>;
}
