# FSRS・成長イベントの移行手順

解答保存（`POST /api/practice`）は、1 つのトランザクションで解答履歴・習熟状態（FSRS）・成長イベント・当日の通し番号をまとめて確定します。既存の解答履歴には習熟状態と学習日が無いため、この手順で引き継ぎます。本番など実データへの適用は、実装・テストとは別の作業です。

この手順は、Docker Compose（リポジトリルートの `docker-compose.yml`、サービス `app`・`db`）で運用し、**アプリを止めたメンテナンス中に移行する**ことを前提にします。コマンドはすべて、Compose ファイルがあるディレクトリで実行します。

## 1. 対象のマイグレーション

- `20261113000000_add_fsrs_memory`: `user_quiz_states.fsrs_memory` を追加します。
- `20261116000000_add_practice_learning_records`: `histories` に `practice_mode`・`study_date`・`daily_attempt_number`・`previous_judgement`・`review_state`・`next_review_at`・`review_settings_version` と一意索引 `(user_id, quiz_id, study_date, daily_attempt_number)` を追加し、`growth_events` テーブルを作成します。
- `20261124000000_allow_null_review_due`: `user_quiz_states.next_review_at` を NULL 可にし、まだ一度も解答していない行（`last_reviewed_at IS NULL`）の期限を NULL（期限なし）にそろえます。

上の 2 つは列・テーブル・索引の追加だけで、既存の行の値を変えません。3 つ目は `user_quiz_states` の未解答の行を `UPDATE` します。解答済みの行と `histories` は変わりません。

## 2. Docker で動かすときの注意

- **コンテナ起動時の自動マイグレーション**: `entrypoint.sh` は、コマンドが `pnpm run start`（既定）のときだけ `migrate:deploy` を実行してからアプリを起動します。`docker compose up` で新しいイメージを起動すると、移行スクリプトの前にアプリが解答を受け付けてしまうため、メンテナンス中は `up` を使わず、`docker compose run --rm app <コマンド>` で個別に実行します。このとき自動マイグレーションとアプリの起動は行われません。
- **移行スクリプトはビルド済みの JS で実行する**: 実行用イメージは devDependencies を削除しているため、`tsx` を使う `pnpm learning:backfill` は動きません。代わりに `packages/backend/dist/scripts/backfillLearningRecords.js` を `node` で実行します。
- **設定ファイル**: `docker compose run` は `app` と同じボリューム（`/iQbe/.config`）を使うので、アプリと同じ `.config/.env`（`DATABASE_URL` など）で接続します。秘密情報を画面やログに出さないよう、下の DB 操作はコンテナ内の環境変数を使います。
- **標準出力の先頭行**: `entrypoint.sh` は最初に `[entrypoint] ...` を 1 行出力します。移行スクリプトの結果は、その後の **最後の 1 行の JSON** です。

以下では、移行スクリプトの実行コマンドを変数にしておきます。

```bash
BACKFILL='docker compose run --rm -T app ./node_modules/.bin/env-cmd -f .config/.env node packages/backend/dist/scripts/backfillLearningRecords.js'
```

## 3. 事前準備（メンテナンスの前に行う）

1. **切り戻し用に旧イメージへタグを付けます。** 新しいイメージをビルドすると同じ名前で上書きされるためです。

   ```bash
   docker compose images app          # REPOSITORY 列がイメージ名
   docker tag <イメージ名>:latest iqbe-app:before-learning-record
   ```

2. **新しいイメージをビルドします。** ビルドだけなら、稼働中の旧コンテナには影響しません。

   ```bash
   docker compose build app
   ```

3. **リハーサルを行います（推奨）。** 本番のダンプをステージング環境に復元し、「4. 当日の手順」の 3〜8 を通しで実行します。次の 2 点を当日より前に把握できます。
   - `--apply` の所要時間（組ごとにトランザクションを開くため、件数に比例して長くなります）。これをメンテナンス時間の見積もりに使います。
   - `unreplayablePairs`・`statesWithoutHistory` に載る元データの問題。当日に判断を迫られないよう、扱いを先に決めておきます（「6. エラーの扱い」）。

## 4. 当日の手順

1. **アプリを止めます（メンテナンス開始）。**

   ```bash
   docker compose stop app
   ```

   `restart: always` のため、メンテナンス中に Docker デーモンを再起動すると旧アプリが自動で起動します。メンテナンス中はデーモンを再起動しません。

2. **DB 全体をバックアップします。** 切り戻しでは DB ごと復元するため、`DROP DATABASE` を含む形で取ります。

   ```bash
   docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysqldump -uroot --single-transaction --routines --add-drop-database --databases "$MYSQL_DATABASE"' > backup-before-learning-record.sql
   ```

3. **未適用のマイグレーションを確認します。**

   ```bash
   docker compose run --rm app pnpm run migrate:status
   ```

   `20261026000000_api_query_indexes` も未適用なら、先に README の「インデックス移行」の事前検査を行います。Docker 上では `node packages/backend/dist/scripts/checkApiIndexes.js` を `BACKFILL` と同じ形で実行します。

4. **マイグレーションを適用します。**

   ```bash
   docker compose run --rm app pnpm run migrate:deploy
   ```

5. **確認モードで実行します。** 何も書かず、作り直す件数と問題のあるデータを出力します。

   ```bash
   $BACKFILL > backfill-dry-run.log; echo "exit=$?"
   tail -n 1 backfill-dry-run.log
   ```

   `exit=1`、つまり `unreplayablePairs`・`failedPairs`・`statesWithoutHistory` のいずれかがあれば、「6. エラーの扱い」に従います。解決できなければ「7. 中止と切り戻し」に進みます。

6. **書き込みを実行します。**

   ```bash
   $BACKFILL --apply > backfill-apply.log; echo "exit=$?"
   tail -n 1 backfill-apply.log
   ```

   中断した場合や `failedPairs` が出た場合は、同じコマンドを再実行します。完了済みの組には何も書きません。

7. **もう一度確認モードで実行し**、`rebuiltStateCount` と `assignedStudyDayCount` が 0、`exit=0` であることを確かめます。

   ```bash
   $BACKFILL > backfill-verify.log; echo "exit=$?"
   tail -n 1 backfill-verify.log
   ```

8. **検証 SQL を実行します。** どちらも 0 件（0）が正常です。

   ```bash
   docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot "$MYSQL_DATABASE"' <<'SQL'
   -- 習熟状態の解答数と履歴件数が食い違う組
   SELECT s.user_id, s.quiz_id, s.review_count, COUNT(h.id) AS history_count
   FROM user_quiz_states s
   LEFT JOIN histories h ON h.user_id = s.user_id AND h.quiz_id = s.quiz_id
   GROUP BY s.user_id, s.quiz_id, s.review_count
   HAVING s.review_count <> COUNT(h.id);

   -- 学習日がまだ入っていない履歴
   SELECT COUNT(*) FROM histories WHERE daily_attempt_number IS NULL;
   SQL
   ```

9. **新しいアプリを起動します（メンテナンス終了）。** 起動時の自動マイグレーションは、適用済みなので何もしません。

   ```bash
   docker compose up -d app
   docker compose logs -f app
   ```

## 5. 切替時点

新しいアプリが最初に処理した解答から、FSRS の更新と成長イベントの記録が始まります。過去の解答の成長イベントは作りません。移行前の履歴の `practice_mode`・`previous_judgement`・`review_state`・`next_review_at`・`review_settings_version` は NULL（不明）のままです。

成長イベントの記録開始時点は「そのユーザーの `histories` のうち `practice_mode IS NOT NULL` の行の最小の `practiced`」と定義します。該当する行が無ければ、そのユーザーの記録はまだ始まっていません。既存の解答回数の集計とイベントの集計は、収集範囲が異なります。

## 6. エラーの扱い

スクリプトの出力（最後の 1 行の JSON）の次の一覧が 1 件でもあれば、終了コードは 1 です。

- `unreplayablePairs`: 判定値が 0〜2 以外の履歴や、壊れた習熟状態の行など、再生できない組。元データを確認して個別に判断します。スクリプトは推測で補いません。
- `statesWithoutHistory`: 履歴が無いのに解答済みになっている習熟状態。元データを確認して個別に判断します。
- `failedPairs`: ロック待ちタイムアウト・接続切断などで処理に失敗した組。その組の書き込みはロールバック済みで、他の組の処理は続きます。原因を解消して同じコマンドを再実行します。

列挙と処理の間に問題・ユーザーが削除された組は `deletedPairCount` に数え、エラーにはしません。

## 7. 中止と切り戻し

新しいアプリを起動する前（4 の 9 より前）なら、いつでも中止できます。メンテナンス中は誰も書き込んでいないので、バックアップへ戻しても失うデータはありません。

```bash
# DB をバックアップ時点に戻す（DROP DATABASE を含む）
docker compose exec -T db sh -c 'MYSQL_PWD="$MYSQL_ROOT_PASSWORD" exec mysql -uroot' < backup-before-learning-record.sql

# 旧イメージを元の名前に戻して起動する
docker tag iqbe-app:before-learning-record <イメージ名>:latest
docker compose up -d --no-build app
```

DB を戻さずに旧イメージだけを起動する方法は取りません。旧イメージにはこの移行のマイグレーションが含まれていないためです。

新しいアプリの起動後に問題が見つかった場合は、旧イメージへは戻さず、アプリを止めて修正したイメージで再開します。起動後は新しい解答が保存されているため、バックアップへ戻すとその解答を失います。

## 8. 移行結果のやり直し

習熟状態と移行前の履歴の番号は、履歴から作り直せます。アプリを止めてから次を実行し、4 の 5〜8 をやり直します。成長イベントと、新しいアプリが保存した解答の記録は消しません。

```sql
DELETE FROM user_quiz_states;
UPDATE histories SET study_date = NULL, daily_attempt_number = NULL WHERE practice_mode IS NULL;
```

## 9. 仕組みの要約

- 移行スクリプトは「ユーザー × 問題」の組を 200 組ずつ列挙し、1 組ごとに 1 トランザクションで処理します。確認モードは `REPEATABLE READ` で読むだけ、`--apply` は `READ COMMITTED` で書きます。
- 習熟状態は、履歴を古い順（`practiced`、`id` の順）に再生した結果と一致します。保存済みの状態の解答数が履歴件数と食い違えば、履歴から作り直します。当日の通し番号は、解答 API と同じ規則（`placeOnStudyDays`）で振ります。
- 解答保存と移行は、どちらも `user_quiz_states` の行を排他ロックして、同じユーザー・問題の処理を直列化します。メンテナンス中は競合する相手がいないため、この前提では効きませんが、アプリを止めずに移行する場合もこの仕組みで整合が保たれます。その場合でも、旧アプリと新アプリが同時に解答を保存する状態は作らないでください（旧アプリはロックを取らないため、当日の通し番号が衝突し得ます）。
- 各解答には、使った FSRS 設定の版（`review_settings_version`）を記録します。NULL は FSRS 接続前の履歴で、再生には版 1 の設定を使います。版 1 の設定値（目標定着率 0.9、学習・再学習ステップ 1 分）は、版を上げずに変えてはいけません。変えると、過去の解答を再生した結果が保存済みの状態と食い違います。
