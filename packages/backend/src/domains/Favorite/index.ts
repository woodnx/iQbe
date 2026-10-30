import Quiz from "../Quiz/index.js";
import User from "../User/index.js";

export default class Favorite {
  constructor(
    private _user: User,
    private _quiz: Quiz,
  ) {}

  get user() {
    return this._user;
  }

  get quiz() {
    return this._quiz;
  }
}
