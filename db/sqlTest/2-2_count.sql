-- 検体ごとの異常の件数と割合
SELECT t.id, t.target_no, t.target_name, 
-- FILTERを利用して条件式付け
  COUNT(r.id) FILTER (WHERE r.result='異常') AS abnormal_count,
-- ROUNDから四捨五入を小数点1桁で行い整数のみ出力
  ROUND(COUNT(r.id) FILTER (WHERE r.result='異常') * 100 / 
-- NULLIFからCOUNTできなかった結果を0で出力
  NULLIF(COUNT(r.id), 0))
   AS abnormal_rate
FROM targets t
-- テーブルの結合
LEFT OUTER JOIN images i ON i.target_id=t.id
LEFT OUTER JOIN results r ON r.image_id=i.id
GROUP BY t.id, t.target_no, t.target_name
ORDER BY t.id;