import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

// repo 루트를 process.cwd()가 아니라 이 스크립트 파일 위치 기준으로 계산,
// 어느 셸/디렉터리에서 pnpm run dev:host를 실행해도 경로가 항상 정확함
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const extensionPath = path.join(repoRoot, "packages", "vscode-extension");

spawnSync("code", [`--extensionDevelopmentPath=${extensionPath}`, repoRoot], {
  stdio: "inherit",
  shell: true,
});
