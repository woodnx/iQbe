export type TransactionOptions = Readonly<{
  isolationLevel?: "read committed" | "repeatable read";
}>;

export default interface ITransactionManager {
  begin<T>(
    callback: () => Promise<T>,
    options?: TransactionOptions,
  ): Promise<T>;
}
