# iqbe-api

## 概要
|host|protocol|version|format|
|---|---|---|---|
|`iqbe-api`|`https`|`v2`|`JSON`|

- 必須パラメータ(required)はパスパラメータとして指定


## アクセストークン
すべてのAPIリクエストに対して，Firebaseで取得したAPIアクセストークンを`Authorization`リクエストヘッダーに付与してください．

## ステータスコード

下記のコードを返却します。

| status code | description |
| - | - |
| 200 | リクエスト成功 |
| 201 | 登録成功 |
| 204 | リクエストに成功したが返却するbodyが存在しない |
| 400 | 不正なリクエストパラメータを指定している |
| 401 | APIアクセストークンが不正、または権限不正 |
| 404 | 存在しないURLにアクセス |
| 429 | リクエスト制限を超えている |
| 500 | 不明なエラー |

# Analysis

## 演習状況
- ユーザがどれくらい演習しているかを出力
- 日時，範囲指定

```
GET /v2/analysis/status/{date} HTTP/1.1
```

### Request
| params | type | discription | required | default |
|  ----  |  --  |  ---------  |  ------  | ------- |
| date | string | 年月日を指定．推奨フォーマットはyyyy-mm-dd | true | |
| period | string | 範囲を指定．day, week, monthの3つのみ| false | `'day'` |

```
{
  "period": "day"
}
```

### Response
| field | type | discription |
|  ---  |  --  |  ---------  |
| start | string | 範囲の一番初めの時刻 |
| end | string | 範囲の一番最後の時刻 |
| right | number | 正答問題数 |
| wrong | number | 誤答問題数 |
| through| number | スルー問題数 |
```
HTTP/1.1 200 OK
[
  {
    "start": "2023-03-24 00:00:00",
    "end": "2023-03-24 23:59:59",
    "right": 3,
    "wrong": 10,
    "through": 14
  },
  {
    "start": "2023-03-23 00:00:00",
    "end": "2023-03-23 23:59:59",
    "right": 10,
    "wrong": 20,
    "through": 17
  },
  {
    "start": "2023-03-22 00:00:00",
    "end": "2023-03-22 23:59:59",
    "right": 13,
    "wrong": 16,
    "through": 4
  },
  {
    "start": "2023-03-21 00:00:00",
    "end": "2023-03-21 23:59:59",
    "right": 4,
    "wrong": 8,
    "through": 2
  },
  {
    "start": "2023-03-20 00:00:00",
    "end": "2023-03-20 23:59:59",
    "right": 6,
    "wrong": 29,
    "through": 4
  },
  {
    "start": "2023-03-19 00:00:00",
    "end": "2023-03-19 23:59:59",
    "right": 8,
    "wrong": 10,
    "through": 8
  },
  {
    "start": "2023-03-18 00:00:00",
    "end": "2023-03-18 23:59:59",
    "right": 3,
    "wrong": 0,
    "through": 4
  },
]
```

## 演習問題数ランキング（全体）
- 演習問題数をランクで出力
- 範囲指定

```
GET /v2/analysis/ranking/all HTTP/1.1
```

### Request
| params | type | discription | required | default |
|  ----  |  --  |  ---------  |  ------  | ------- |
| period | string | 範囲を指定．day, week, monthの3つのみ| false | `'day'` |
| limit | number | ランキングの表示数(max 6) | false | 6 |

```
{
  "period": "day",
  "limit": 4
}
```

### Response
| field | type | discription |
|  ---  |  --  |  ---------  |
| rank | number | 順位 |
| userId | number | ユーザID |
| name | string | ユーザ名 |
| count | number | 演習問題数 |
| compare | number | 前のランクとの上下 |
```
HTTP/1.1 200 OK
[
  {
    "rank": 1,
    "userId": 3,
    "name": "hoge",
    "count": 120,
    "compare": 0
  }
]
```

## 個人演習問題数ランク
- 演習問題数をランクで出力
- 範囲指定

```
GET /v2/analysis/ranking/account HTTP/1.1
```

### Request
| params | type | discription | required | default |
|  ----  |  --  |  ---------  |  ------  | ------- |
| period | string | 範囲を指定．day, week, monthの3つのみ| false | `'day'` |

```
{
  "period": "day"
}
```

### Response
| field | type | discription |
|  ---  |  --  |  ---------  |
| rank | number | 順位 |
| name | string | ユーザ名 |
| count | number | 演習問題数 |
| compare | number | 前のランクとの上下 |
```
HTTP/1.1 200 OK
[
  {
    "rank": 1,
    "name": "hoge",
    "count": 120,
    "compare": 0
  }
]
```