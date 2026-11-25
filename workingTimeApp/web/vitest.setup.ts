import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// 各テストのあとに、render した部品を画面（jsdom）から片付ける。
// globals を使わない設定では React Testing Library の自動の片付けが動かないため、ここで呼ぶ。
afterEach(() => {
  cleanup();
});
