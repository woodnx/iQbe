import { customAlphabet } from 'nanoid';

export default class WorkbookService {
  generateWid() {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-', 10)
    return nanoid(10);
  }
}
