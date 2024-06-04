import History from ".";

export default interface IHistoryRepository {
  add(history: History): Promise<void>, 
}
