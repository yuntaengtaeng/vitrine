import fs from "node:fs";
import path from "node:path";

const PORT_FILE_DIR = ".vitrine";
const PORT_FILE_NAME = "port.json";

export interface PortFileData {
  port: number;
  pid: number;
}

/** 프로젝트 루트 기준 포트 파일 절대 경로 */
export function getPortFilePath(root: string): string {
  return path.join(root, PORT_FILE_DIR, PORT_FILE_NAME);
}

/** dev 서버 포트/PID 기록, 포트 파일 디렉토리 자체는 gitignore 처리 */
export function writePortFile(root: string, data: PortFileData): void {
  const dir = path.join(root, PORT_FILE_DIR);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, ".gitignore"), "*\n", "utf-8");
  fs.writeFileSync(getPortFilePath(root), JSON.stringify(data), "utf-8");
}

/** 포트 파일 삭제, 이미 없으면 무시 */
export function removePortFile(root: string): void {
  try {
    fs.rmSync(getPortFilePath(root));
  } catch {
    // 정상 종료 전 이미 지워졌거나 애초에 기록된 적 없는 경우
  }
}
