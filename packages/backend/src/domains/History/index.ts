import Quiz from "../Quiz";
import User from "../User";

export default class History {
  constructor(
    private _quiz: Quiz,
    private _user: User,
    private _pressedWordPosiston: number | null,
    private _judgement: number,
  ) {}

  get quiz(): Quiz {
    return this._quiz;
  }

  get user(): User {
    return this._user;
  }

  get pressedWordPosition(): number | null{
    return this._pressedWordPosiston;
  }

  get judgement(): number {
    return this._judgement;
  }
}
