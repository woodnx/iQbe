# API性能比較

2026-10-26、使い捨てのMySQL 9.1コンテナで測定。クイズ2,004件、履歴24,006件、3回のウォームアップ後に20回実行したp95です。HTTP認証・通信全体ではなく、QueryService／件数取得処理を測定しています。

| 処理 | 旧方式p95 | 新方式p95（追加インデックスあり） | SQL数／回 | 取得行数／回 |
|---|---:|---:|---:|---:|
| 7期間の解答集計 | 27.680ms | 27.007ms | 21 → 1 | 21 → 7 |
| クイズ件数取得 | 8.890ms | 6.210ms | 2 → 2 | 2004 → 2 |

追加インデックスなしの新方式では、集計p95は15.183ms、件数取得p95は5.571msでした。このデータではインデックス単独の応答時間改善は確認できませんでした。

繰り返し測定では集計p95に変動があり、上表の最終測定では集計応答時間の明確な改善は確認できませんでした。SQL発行数と取得行数の削減は再現しています。インデックスの採用根拠は、下記の個人別期間検索・全体ランキングでの走査行数削減です。

旧集計は7期間×3判定の21クエリ、新集計は期間全体の履歴を1回で読み、期間番号と判定ごとに集計して7期間にLEFT JOINする1クエリです。旧件数方式はウィンドウ関数の結果を全行取得、新方式はCOUNTの1行のみ取得します。件数取得のSQL数・取得行数にはユーザーID解決の1クエリ・1行を含みます。

件数の比較は自分の作成分に対象を揃え、集計の比較は日本時間・半開区間に揃えて結果の一致を検証しています。旧方式の不整合を含めたエンドポイント全体との比較ではありません。

インデックス追加後にMySQLの統計を更新し、EXPLAIN ANALYZEで個人別の期間検索に `histories_user_practiced_idx`、全体の期間ランキングに `histories_practiced_user_idx` が使われることを確認しています。

実行計画（MySQLの出力）：

## before: 個人別期間集計

```text
-> Aggregate: count(0)  (cost=452 rows=1) (actual time=4.91..4.91 rows=1 loops=1)
    -> Filter: ((histories.practiced >= TIMESTAMP'2026-10-25 15:00:00') and (histories.practiced < TIMESTAMP'2026-10-26 15:00:00'))  (cost=148 rows=1321) (actual time=0.122..4.88 rows=801 loops=1)
        -> Covering index lookup on histories using PRIMARY (user_id = 1)  (cost=148 rows=11891) (actual time=0.117..3.61 rows=24004 loops=1)
```

## before: 全体ランキング

```text
-> Limit: 5 row(s)  (actual time=4.98..4.98 rows=1 loops=1)
    -> Sort: `COUNT(*)` DESC, limit input to 5 row(s) per chunk  (actual time=4.97..4.97 rows=1 loops=1)
        -> Stream results  (cost=3027 rows=1) (actual time=4.96..4.96 rows=1 loops=1)
            -> Group aggregate: count(0)  (cost=3027 rows=1) (actual time=4.96..4.96 rows=1 loops=1)
                -> Filter: ((histories.practiced >= TIMESTAMP'2026-10-25 15:00:00') and (histories.practiced < TIMESTAMP'2026-10-26 15:00:00'))  (cost=2419 rows=2642) (actual time=0.24..4.92 rows=801 loops=1)
                    -> Covering index scan on histories using PRIMARY  (cost=2419 rows=23783) (actual time=0.235..3.65 rows=24006 loops=1)
```

## after: 個人別期間集計

```text
-> Aggregate: count(0)  (cost=349 rows=1) (actual time=0.264..0.264 rows=1 loops=1)
    -> Filter: ((histories.user_id = 1) and (histories.practiced >= TIMESTAMP'2026-10-25 15:00:00') and (histories.practiced < TIMESTAMP'2026-10-26 15:00:00'))  (cost=164 rows=801) (actual time=0.0332..0.23 rows=801 loops=1)
        -> Covering index range scan on histories using histories_user_practiced_idx over (user_id = 1 AND '2026-10-25 15:00:00' <= practiced < '2026-10-26 15:00:00')  (cost=164 rows=801) (actual time=0.0315..0.147 rows=801 loops=1)
```

## after: 全体ランキング

```text
-> Limit: 5 row(s)  (actual time=0.375..0.376 rows=1 loops=1)
    -> Sort: `COUNT(*)` DESC, limit input to 5 row(s) per chunk  (actual time=0.375..0.375 rows=1 loops=1)
        -> Table scan on <temporary>  (actual time=0.363..0.364 rows=1 loops=1)
            -> Aggregate using temporary table  (actual time=0.362..0.362 rows=1 loops=1)
                -> Filter: ((histories.practiced >= TIMESTAMP'2026-10-25 15:00:00') and (histories.practiced < TIMESTAMP'2026-10-26 15:00:00'))  (cost=164 rows=801) (actual time=0.0339..0.225 rows=801 loops=1)
                    -> Covering index range scan on histories using histories_practiced_user_idx over ('2026-10-25 15:00:00' <= practiced < '2026-10-26 15:00:00')  (cost=164 rows=801) (actual time=0.0322..0.154 rows=801 loops=1)
```

## 再測定

```bash
pnpm --filter backend test:benchmark
```

測定値は実行環境・キャッシュ・データ分布に依存します。本番相当データで再測定して判断してください。
