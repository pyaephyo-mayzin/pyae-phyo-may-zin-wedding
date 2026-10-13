# RSVP保存機能の有効化（日本語）

このZIPのフォームはページ内に配置済みです。ただし、**Supabaseの設定が終わるまでは送信できません**（誤って回答を失わないよう送信ボタンを無効化しています）。

## 1. Supabaseでデータベースを準備

1. https://supabase.com/ にログインして New project を作成。
2. プロジェクトの **SQL Editor → New query** を開く。
3. 同梱の `supabase-setup.sql` の全文を貼り、**Run** をクリック。
4. テーブル `public.wedding_rsvps` が作られます。

## 2. Webサイトを接続

1. Supabase の **Project URL** と **Publishable key** (`sb_publishable_...`) を Settings / API Keys または Connect からコピー。
2. `config.js` の `supabase.url` と `supabase.publishableKey` を書き換える。
3. **secret / service_role キーは絶対にHTMLやJavaScriptに貼らないでください。**
4. 5つのウェブファイルを GitHub のリポジトリ直下にアップロード：`index.html`、`style.css`、`script.js`、`config.js`、必要ならこのREADMEやSQLも置けます。
5. GitHub の **Settings → Pages → Deploy from a branch → main / (root) → Save**。
6. 公開URLからテスト回答し、Supabase **Table Editor → wedding_rsvps** に保存されていることを確認。

## 3. 参加者はどのように使う？

公開URLをLINE/Messenger/メールでシェア。参加者はアカウントなしでページ内のフォームから「名前」「参加/欠席」「参加人数（参加の場合1～5名）」「任意メッセージ」を送信できます。送信が成功したときだけ完了メッセージが出ます。

## 4. 主催者による確認

Supabase のダッシュボードにログインし、**Table Editor → wedding_rsvps** を開くとすべての回答を閲覧できます。`attendance` が `yes` は参加、`no` は欠席です。`guest_count` には本人を含む人数を保存し、欠席時は0です。

## 5. セキュリティと注意点

- データベースには RLS と INSERT 専用の権限を設定しています。ゲストは他人の回答を読み出したり編集したりできません。
- ただし公開フォームのため、スパム投稿や同じ方からの複数回答は可能です。参加者へのURL配布を限定し、大規模運用なら CAPTCHA / レート制限 / 重複回答対策を追加してください。
- サイトのソースは GitHub Pages では公開されるため、公開鍵以外の秘密情報を入れないでください。
- 招待客の氏名など個人情報を扱うため、収集目的を明示し、イベント終了後は不要なデータを削除してください。
- 実際の送信にはSupabaseプロジェクトが必要で、ZIPのみでは永続保存できません。
