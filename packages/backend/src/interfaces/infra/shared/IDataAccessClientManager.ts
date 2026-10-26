export default interface IDataAccessClientManager<T> {
  getClient(): T;
}
