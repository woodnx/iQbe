import Quiz from "../Quiz";
import User from "../User";

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
