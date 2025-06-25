import { customAlphabet } from "nanoid";

export default class MylistService {
  genereateMid(): string {
    const nanoid = customAlphabet(
      "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-",
      10,
    );
    return nanoid(10);
  }
}
