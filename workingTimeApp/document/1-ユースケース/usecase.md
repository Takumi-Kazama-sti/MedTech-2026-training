# 出退勤アプリ
## ユースケース
``` mermaid
graph TB
  subgraph "出退勤アプリ"
    subgraph users[アクター]
      employee((従業員))
      admin((管理者))
    end
    subgraph sg1[打刻]
      Start[出勤]
      End[退勤]
      Break[休憩開始]
      BackToWork[休憩終了]
    end
    subgraph sg2[月ごとの勤務一覧]
      WorkCount[出勤回数]
      EndCount[退勤回数]
      BreakCount[休憩]
      WorkTime[実働時間]
      OverTime[残業時間]
    end
    subgraph sg3[従業員管理]
      Regist[登録]
      Undo[無効化]
    end
    subgraph sg4[従業員勤務一覧]
      Index[一覧確認]
      CSV[CSV出力]
    end
  end
employee --> Start
employee --> End
employee --> Break
employee --> BackToWork

employee --> sg2

admin --> Regist
admin --> Undo
admin --> Index
admin --> CSV

```