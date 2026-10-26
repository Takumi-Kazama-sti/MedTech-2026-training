# 出退勤アプリ
## シーケンス図

``` mermaid
sequenceDiagram
  actor User as 従業員/管理者
  participant App as 出退勤アプリ画面
  participant API
  participant DB

  User->>App: ログイン
  App->>API: POST ログイン(ボディ：ログインID、パスワード)
  activate API
  API->>DB: ログインIDで有効な従業員検索
  DB-->>API: 従業員(パスワードハッシュ、role)
  API-->>API: Argon2でパスワード照合
  API-->>API: トークン発行(従業員ID・role・有効期限入れて署名)
  API->>App: 200 (トークン、role)
  deactivate API
  App-->>App: トークンをCookieの中に保持させる
  App->>User: roleに応じた画面遷移
  Note over User,DB: ログイン

  User->>App: 打刻ボタン
  App->>API: POST 打刻(ヘッダー Authorization：Bearer トークン、パスパラメータ：従業員ID)
  activate API
  API->>API: トークン検証
  API->>DB: 従業員IDで勤怠を登録・更新
  DB-->>API: 更新完了
  API->>App: 200(登録・更新結果)
  deactivate API
  App->>User: 画面更新
  Note over User,DB: 打刻

  User->>App: 従業員登録ボタン
  App->>API: POST 従業員登録(ヘッダー Authorization：Bearer トークン、ボディ：ログイン情報)
  activate API
  API->>API: トークンの検証
  API->>API: パスワードをArgon2でハッシュ化
  API->>DB: 従業員情報をINSERT
  DB-->>API: 登録完了
  API->>App: 201(登録した従業員)
  deactivate API
  App-->>User: 結果をログとして出力
  Note over User,DB: 従業員登録

  User->>App: 従業員無効化ボタン
  App->>API: POST 従業員無効(ヘッダー：トークン、ボディ：ログインID)
  activate API
  API->>API: トークンの検証
  API->>DB: ログインIDから従業員情報を更新(is_active: false)
  DB-->>API: 更新完了
  API->>App: 201(従業員ID、有効フラグ確認)
  deactivate API
  App->>User: 結果を画面に表示
  Note over User,DB: 従業員無効化

  User->>App: 管理者ログイン
  App->>API: GET 月別従業員勤務一覧(ヘッダー：トークン、ボディ：検索情報)
  activate API
  API->>API: トークンの検証
  API->>DB: 検索情報から従業員勤務一覧を取得
  DB-->>API: 取得完了
  API->>App: 200(一覧情報)
  deactivate API
  App->>User: 一覧情報を画面に表示
  Note over User,DB: 月別従業員勤務一覧取得
```