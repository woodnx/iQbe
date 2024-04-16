import type { ColumnType } from "kysely";
export type Generated<T> = T extends ColumnType<infer S, infer I, infer U>
  ? ColumnType<S, I | undefined, U>
  : ColumnType<T, T | undefined, T>;
export type Timestamp = ColumnType<Date, Date | string, Date | string>;

export type categories = {
    id: Generated<number>;
    name: string;
    description: string | null;
};
export type favorites = {
    user_id: number;
    quiz_id: number;
    registered: Timestamp;
};
export type histories = {
    user_id: number;
    quiz_id: number;
    practiced: Timestamp;
    judgement: number;
    pressed_word: Generated<number | null>;
};
export type invite_codes = {
    id: Generated<number>;
    code: string;
    used: Generated<number>;
};
export type levels = {
    id: Generated<number>;
    name: string;
    value: string;
    color: string;
};
export type mylists = {
    id: Generated<number>;
    user_id: number;
    name: Generated<string>;
    created: Timestamp;
    attr: number;
    mid: Generated<string | null>;
};
export type mylists_quizzes = {
    mylist_id: number;
    quiz_id: number;
    registered: Timestamp;
};
export type password_reset_tokens = {
    id: Generated<number>;
    user_id: number;
    token: string;
    expDate: Timestamp;
    used: Generated<number>;
};
export type quiz_reports = {
    quiz_id: number;
    user_id: number;
    reason: Generated<string | null>;
    registered: Timestamp | null;
};
export type quiz_tags = {
    id: Generated<number>;
    label: string;
    color: string | null;
};
export type quiz_visible_users = {
    quiz_id: number;
    user_id: number;
};
export type quizzes = {
    id: Generated<number>;
    workbook_id: number | null;
    que: string;
    ans: string;
    anoans: string | null;
    attribute: string | null;
    total_crct_ans: number | null;
    total_wrng_ans: number | null;
    total_through_ans: number | null;
    creator_id: number | null;
};
export type quizzes_categories = {
    quiz_id: number;
    category_id: number;
    sub_category_id: number;
    user_id: number;
};
export type refresh_tokens = {
    id: Generated<number>;
    user_id: number;
    token: Buffer;
    expDate: Timestamp;
    expired: Generated<number>;
};
export type SequelizeMeta = {
    name: string;
};
export type sub_categories = {
    id: Generated<number>;
    parent_id: number;
    name: string;
    description: string | null;
};
export type test_quizzes = {
    id: Generated<number>;
    original_quiz_id: number;
    test_id: number;
};
export type users = {
    id: Generated<number>;
    uid: Generated<string>;
    nickname: Generated<string>;
    username: Generated<string>;
    email: Generated<string>;
    passwd: Generated<string>;
    modified: Timestamp;
    created: Timestamp;
};
export type workbooks = {
    id: Generated<number>;
    name: Generated<string>;
    date: Timestamp | null;
    level_id: number | null;
    wid: string;
    creator_id: number;
};
export type DB = {
    categories: categories;
    favorites: favorites;
    histories: histories;
    invite_codes: invite_codes;
    levels: levels;
    mylists: mylists;
    mylists_quizzes: mylists_quizzes;
    password_reset_tokens: password_reset_tokens;
    quiz_reports: quiz_reports;
    quiz_tags: quiz_tags;
    quiz_visible_users: quiz_visible_users;
    quizzes: quizzes;
    quizzes_categories: quizzes_categories;
    refresh_tokens: refresh_tokens;
    SequelizeMeta: SequelizeMeta;
    sub_categories: sub_categories;
    test_quizzes: test_quizzes;
    users: users;
    workbooks: workbooks;
};
