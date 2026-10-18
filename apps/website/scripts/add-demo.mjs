import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// 라이브 데모는 지금 저장소의 plugin으로 만든 showcase Gallery라 사이트와 함께 배포
const websiteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(websiteRoot, "..", "..");
const galleryDir = path.join(repoRoot, "examples", "showcase", "vitrine-static");
const demoDir = path.join(websiteRoot, "build", "client", "demo");

const pnpm = (args) =>
  process.platform === "win32"
    ? execFileSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", "pnpm", ...args], { cwd: repoRoot, stdio: "inherit" })
    : execFileSync("pnpm", args, { cwd: repoRoot, stdio: "inherit" });

pnpm(["run", "build"]);
pnpm(["--filter", "@vitrine/example-showcase", "build:gallery"]);

fs.rmSync(demoDir, { recursive: true, force: true });
fs.cpSync(galleryDir, demoDir, { recursive: true });
console.log(`Live demo copied to ${path.relative(repoRoot, demoDir)}`);
