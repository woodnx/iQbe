import { customAlphabet } from "nanoid";

export default class QuizService {
  constructor() {}

  generateQid(): string {
    const nanoid = customAlphabet(
      "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-",
      10,
    );
    return nanoid(20);
  }
}
