import { defineConfig } from "vitest/config";

// NestJS 12 の ESM テンプレート（@nestjs/schematics の files/ts-esm/vitest.config.ts）と同じ形。
// このプロジェクトは CommonJS（package.json に "type": "module" がない）なので、
// 設定ファイルは ESM として読まれる .mts にしている。
export default defineConfig({
	// tsconfig.json の paths を読む（Vite 8 の機能）
	resolve: { tsconfigPaths: true },
	test: {
		// describe / it / expect をインポートせずに使う（tsconfig の types に vitest/globals を入れている）
		globals: true,
		root: "./",
		include: ["**/*.spec.ts"],
		coverage: {
			include: ["src/**/*.ts"],
			exclude: ["src/generated/**", "src/main.ts"],
			reportsDirectory: "./coverage",
		},
	},
});
