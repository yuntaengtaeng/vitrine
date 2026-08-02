import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// repo 루트를 process.cwd()가 아니라 이 스크립트 파일 위치 기준으로 계산,
// 어느 셸/디렉터리에서 pnpm run dev:host를 실행해도 경로가 항상 정확함
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionPath = path.join(repoRoot, "packages", "vscode-extension");

// shell:true는 인자를 이스케이프 없이 이어붙임, 공백 포함 경로가 쪼개지지 않도록 직접 따옴표 처리
const quoteIfNeeded = (value) => (/\s/.test(value) ? `"${value}"` : value);

spawnSync("code", [
  quoteIfNeeded(`--extensionDevelopmentPath=${extensionPath}`),
  quoteIfNeeded(repoRoot),
], {
  stdio: "inherit",
  shell: true,
});
