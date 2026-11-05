# 出退勤アプリ
## テーブル定義

- 従業員テーブル

| 論理名 | 物理名 (カラム名) | データ型 | 制約 | 初期値 | 説明 |
| --- | --- | --- | --- | --- | --- |
| ID | `id` | UUID | PK | gen_random_uuid() | ユーザーの一意識別子 |
| 従業員ID | `login_id` | VARCHAR(50) | NOT NULL, UNIQUE | - | ログイン画面で入力するID |
| パスワード | `login_password_hash` | VARCHAR(255) | NOT NULL | - |ハッシュ化したパスワード(Argon2id の出力文字列（ソルト・パラメータを含む）を保存)|
| 従業員氏名 | `name` | VARCHAR(50) | NOT NULL | - | ヘッダーに表示する名前、管理者用一覧画面に表示する名前 |
| ユーザー権限ID | `role_id` | INT | FK(roles.id) NOT NULL | - | ユーザー権限ID、1: 一般、2: 管理者、99: 開発者 |
| 従業員有効 | `is_active` | VARCHAR(10) | NOT NULL | TRUE | 従業員として存在するか |
|  |  |  |  |  |  |

- ユーザー権限テーブル

| 論理名 | 物理名 (カラム名) | データ型 | 制約 | 初期値 | 説明 |
| --- | --- | --- | --- | --- | --- |
| ID | `id` | INT | PK | - | ユーザー権限の一意識別子 |
| 権限名 | `role_name` | VARCHAR(20) | NOT NULL | - | 権限名 |
| 権限詳細 | `role_detail` | VARCHAR(50) | - | - | 権限の役割説明 |

- 勤怠記録テーブル

| 論理名 | 物理名 (カラム名) | データ型 | 制約 | 初期値 | 説明 |
| --- | --- | --- | --- | --- | --- |
| ID | `id` | INT | PK, Auto Increment | - | 勤怠記録の一意識別子 |
| 従業員ID | `employee_id` | UUID | FK(employees.id) NOT NULL | - | 打刻した従業員 |
| 出勤年月日 | `work_date` | DATE | NOT NULL | - | 従業員が出勤した日 |
| 出勤時間 | `work_in_time` | TIMESTAMPTZ | NOT NULL | - | 出勤ボタンを押した日時 |
| 退勤時間 | `work_out_time` | TIMESTAMPTZ | - | NULL | 退勤ボタンを押した日時 |

- 勤怠休憩テーブル

| 論理名 | 物理名 (カラム名) | データ型 | 制約 | 初期値 | 説明 |
| --- | --- | --- | --- | --- | --- |
| ID | `id` | INT | PK, Auto Increment | - | 休憩記録の一意識別子 |
| 勤怠記録ID | `attendance_id` | INT | FK(attendances.id) NOT NULL | - | 勤怠記録 |
| 休憩開始時間 | `break_in_time` | TIMESTAMPTZ | - | NULL | 休憩開始ボタンを押した日時 |
| 休憩終了時間 | `break_out_time` | TIMESTAMPTZ | - | NULL | 休憩終了ボタンを押した日時 |

- 管理者用従業員勤務一覧テーブル

| 論理名 | 物理名 (カラム名) | データ型 | 制約 | 初期値 | 説明 |
| --- | --- | --- | --- | --- | --- |
| ID | `id` | INT | PK, Auto Increment | - | 従業員勤務一覧の一意識別子 |
| 従業員ID | `employee_id` | UUID | FK(employees.id) NOT NULL | - | 従業員 |
| 従業員氏名 | `employee_name` | VARCHAR(50) | NOT NULL | - | ヘッダーに表示する名前、管理者用一覧画面に表示する名前 |
| 出勤年月 | `work_month` | VARCHAR(50) | NOT NULL | - | 従業員が出勤した年月 |
| 出勤回数 | `work_in_count` | INT | NOT NULL | 0 | 月当たり従業員が出勤ボタンを押した回数 |
| 退勤回数 | `work_out_count` | INT | NOT NULL | 0 | 月当たり従業員が退勤ボタンを押した回数 |
| 実働時間 | `work_monthly_time` | INT | NOT NULL | - | 従業員の実働時間、拘束時間-休憩時間を月ごとにまとめる |
| 休憩時間 | `break_monthly_time` | INT | - | NULL | 従業員の休憩時間、休憩時間を月ごとにまとめる |
| 時間外労働時間 | `over_time` | INT | - | NULL | 8時間から超えた労働時間 |
