import fs from "node:fs";
import path from "node:path";

export interface PortFileMatch {
  root: string;
  port: number;
  pid: number;
}

const PORT_FILE_REL = path.join(".vitrine", "port.json");
const SKIP_DIR_NAMES = new Set(["node_modules", ".git", "dist", ".vitrine"]);

/** 시작 경로에서 위로 올라가며 가장 가까운 포트 파일 탐색 */
export function findPortFileUpward(startPath: string): PortFileMatch | null {
  let dir = directoryOf(startPath);

  while (true) {
    const match = readPortFile(dir);
    if (match) return match;

    const parent = path.dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/** 주어진 워크스페이스 루트들 아래에서 포트 파일 전부 탐색 */
export function findPortFilesInWorkspace(roots: string[], maxDepth = 4): PortFileMatch[] {
  const results: PortFileMatch[] = [];
  for (const root of roots) walk(root, maxDepth, results);
  return results;
}

/** PID가 가리키는 프로세스가 살아있는지 확인 */
export function isProcessAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function walk(dir: string, depthLeft: number, results: PortFileMatch[]): void {
  const match = readPortFile(dir);
  if (match) results.push(match);
  if (depthLeft <= 0) return;

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || SKIP_DIR_NAMES.has(entry.name)) continue;
    walk(path.join(dir, entry.name), depthLeft - 1, results);
  }
}

function readPortFile(dir: string): PortFileMatch | null {
  const file = path.join(dir, PORT_FILE_REL);
  if (!fs.existsSync(file)) return null;

  try {
    const data: unknown = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (
      data &&
      typeof data === "object" &&
      typeof (data as { port?: unknown }).port === "number" &&
      typeof (data as { pid?: unknown }).pid === "number"
    ) {
      const { port, pid } = data as { port: number; pid: number };
      return { root: dir, port, pid };
    }
    return null;
  } catch {
    return null;
  }
}

function directoryOf(startPath: string): string {
  try {
    return fs.statSync(startPath).isDirectory() ? startPath : path.dirname(startPath);
  } catch {
    return path.dirname(startPath);
  }
}
