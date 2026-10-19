-- 朝昼晩の食事について
CREATE TABLE meals(
  id SERIAL,
  time VARCHAR(255) NOT NULL,
  meal VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
);
