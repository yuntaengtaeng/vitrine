import path from "node:path";
import type { PreviewEntry } from "./scan.js";

type EditorTargetEntry = Pick<PreviewEntry, "id" | "file" | "startLine">;

// Vite 내장 middleware는 상대 경로를 cwd 기준으로 풀어서 Vite root가 cwd와 다르면 다른 파일을 가리킴
const VITE_OPEN_IN_EDITOR_ROUTE = "/__open-in-editor";

/** preview id에 해당하는 소스의 절대 경로와 시작 위치 조회 (`경로:줄:열` 형식), 없으면 null */
export function resolveEditorTarget(entries: EditorTargetEntry[], root: string, id: string): string | null {
  const entry = entries.find((candidate) => candidate.id === id);
  if (!entry) return null;
  // 열을 생략하면 launch-editor가 숫자 기본값을 넣고 Windows의 LAUNCH_EDITOR 경로에서 문자열로 다루다 실패
  return `${path.resolve(root, entry.file)}:${entry.startLine}:1`;
}

/** Gallery의 open-in-editor 요청 URL을 Vite 내장 `/__open-in-editor` 요청 URL로 변환, 대상이 없으면 null */
export function toViteOpenInEditorUrl(requestUrl: string, entries: EditorTargetEntry[], root: string): string | null {
  const id = new URL(requestUrl, "http://localhost").searchParams.get("id");
  const target = id ? resolveEditorTarget(entries, root, id) : null;
  return target ? `${VITE_OPEN_IN_EDITOR_ROUTE}?file=${encodeURIComponent(target)}` : null;
}
