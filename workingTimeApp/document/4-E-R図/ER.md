# 出退勤アプリ
## E-R図

``` mermaid
erDiagram
  employees ||--o{ attendances: "1従業員は0以上の打刻"
  employees ||--o{ employee_monthly_indexes : "1従業員は0以上の毎月の勤務一覧がある"
  employees }o--|| roles: "1つの権限には複数の従業員が入る"
  attendances ||--o{ breakes: "勤怠記録は0以上の休憩回数がある"

  %% 従業員エンティティ
  employees {
    UUID id PK
    VARCHAR(50) login_id UK "ログインID"
    VARCHAR(255) login_password_hash "ハッシュ化パスワード"
    VARCHAR(50) name "従業員名"
    INT role_id FK "ユーザー権限ID"
    VARCHAR(10) is_active "従業員有効"
  }

  %% ユーザー権限エンティティ
  roles {
    INT id PK 
    VARCHAR(20) role_name "権限名" 
    VARCHAR(50) role_detail "権限の役割説明"
  }

  %% 勤怠記録エンティティ(月日ごとに別のデータ)
  attendances {
    INT id PK
    UUID employee_id FK "従業員ID"
    date work_date "出勤年月日　YYYY-MM-DD"
    timestamptz work_in_time "出勤時間"
    timestamptz work_out_time "退勤時間"
    INTERVAL duty_time "滞在時間(拘束時間)、退勤-出勤"
  }

  %% 打刻休憩エンティティ (1休憩ごとに別のデータ、同じ日に2回ある場合もある)
  breakes {
    INT id PK
    INT attendance_id FK "打刻ID"
    timestamptz break_in_time "休憩開始時間"
    timestamptz break_out_time "休憩終了時間"
    INTERVAL break_time "休憩時間、終了-開始"
  }

  %% 従業員勤務一覧エンティティ(年月とユーザー毎に別データ)
  employee_monthly_indexes {
    INT id PK
    UUID employee_id FK "従業員ID"
    VARCHAR(50) employee_name "従業員名"
    date work_month "出勤年月"
    INT work_in_count "出勤回数"
    INT work_out_count "退勤回数"
    INTERVAL work_monthly_time "実働時間、滞在時間-休憩時間"
    INTERVAL break_monthly_time "休憩時間"
    INTERVAL over_time "時間外労働時間、8時間から超えた労働時間"
  }
```