import { customAlphabet } from 'nanoid';

export default class TagService {
  generateTid() {
    const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-')
    return nanoid(10);
  }
}
