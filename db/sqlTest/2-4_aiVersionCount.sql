-- 特定の AI モデルのバージョンで判定した結果の件数
-- バージョン|結果|その結果のカウント
SELECT r.ai_version, r.result, COUNT(r.result) AS result_count
FROM results r
WHERE r.result IS NOT NULL
GROUP BY r.ai_version, r.result
ORDER BY r.ai_version, r.result;
