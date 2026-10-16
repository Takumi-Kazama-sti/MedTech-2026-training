-- サンプルデータの挿入
-- 検体
INSERT INTO targets(id, target_no, target_name)
VALUES
  (1, 1001, '検体A'),
  (2, 1002, '検体B'),
  (3, 1003, '検体C');

-- 画像(検体ごとに複数枚)
INSERT INTO images(id, target_id, data_path)
VALUES
  (1, 1, '/images/1001/img_001.png'),
  (2, 1, '/images/1001/img_002.png'),
  (3, 1, '/images/1001/img_003.png'),
  (4, 1, '/images/1001/img_004.png'),
  (5, 2, '/images/1002/img_001.png'),
  (6, 2, '/images/1002/img_002.png'),
  (7, 3, '/images/1003/img_001.png'),
  (8, 3, '/images/1003/img_002.png'),
  (9, 3, '/images/1003/img_003.png');

-- 判定結果(画像ごと)
INSERT INTO results(id, image_id, result, conf_score, ai_version, created_at, created_by)
VALUES
  (1, 1, '正常',     95, 'v1.0.0', '2026-10-01 09:15:00', 'tanaka'),
  (2, 2, '正常',     88, 'v1.0.0', '2026-10-01 09:16:00', 'tanaka'),
  (3, 3, '異常',     76, 'v1.0.0', '2026-10-01 09:18:00', 'tanaka'),
  (4, 4, NULL,       0,  'v1.0.0', '2026-10-01 10:18:00', 'tanaka'),
  (5, 5, '異常',     91, 'v1.1.0', '2026-10-02 13:40:00', 'suzuki'),
  (6, 6, '判定不能', 32, 'v1.1.0', '2026-10-02 13:42:00', 'suzuki'),
  (7, 7, '正常',     97, 'v1.1.0', '2026-10-03 10:05:00', 'sato'),
  (8, 8, '正常',     84, 'v1.1.0', '2026-10-03 10:07:00', 'sato'),
  (9, 9,  NULL,       0,  'v1.1.0', '2026-10-03 10:18:00', 'tanaka');

-- 監査ログ(未作成)
INSERT INTO user_logs(created_at, created_by, log_code, log_level, log_meg)
VALUES
  ('2026-09-30 09:15:00', 'tanaka', 'LOG-001', 'Info', 'これはテストです');
