-- 判定結果の更新と監査ログの追加
BEGIN;
  -- 判定結果の更新
  WITH updated AS (
    UPDATE results
    SET result='正常', conf_score=50, 
    created_at = CURRENT_TIMESTAMP(0),
    created_by = 'tanaka'
    WHERE id=4 AND result IS NULL
    RETURNING id, result, created_at, created_by
  )

  -- 監査ログの追加
  INSERT INTO user_logs (created_at, created_by, log_code, log_level, log_meg)
  SELECT 
    created_at, created_by, 'LOG-002', 'Info', 
    '判定結果を更新しました, id=' || id || ', result=' || result
  FROM updated;
COMMIT;