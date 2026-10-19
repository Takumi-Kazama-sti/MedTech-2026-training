-- まだ確定していない判定結果を、古い順に表示
-- 確定していない結果をNULLとして扱う

SELECT r.id, r.image_id, r.result, r.ai_version, r.conf_score, r.created_at
FROM results r
LEFT OUTER JOIN images i ON i.id=r.image_id
LEFT OUTER JOIN targets t ON t.id=i.target_id
WHERE r.result IS NULL
GROUP BY r.id, r.image_id, r.result, r.ai_version, r.conf_score, r.created_at
ORDER BY r.created_at;