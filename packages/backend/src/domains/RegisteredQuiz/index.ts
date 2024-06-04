import Mylist from "../Mylist";
import Quiz from "../Quiz";

export default class RegisteredQuiz {
  constructor(
    private _mylist: Mylist,
    private _quiz: Quiz,
  ) {}

  get mylist() {
    return this._mylist;
  }

  get quiz() {
    return this._quiz;
  }
}
