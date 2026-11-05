--- 「判定不能」が 1 件以上ある検体の一覧
--- テーブル結合
SELECT DISTINCT t.id, t.target_no, t.target_name FROM targets t
JOIN images i ON t.id=i.target_id
JOIN results r ON i.id=r.image_id
-- 条件式
WHERE r.result='判定不能'
ORDER BY t.id;
