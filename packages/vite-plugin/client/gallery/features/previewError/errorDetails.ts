export interface PreviewFailure {
  message: string;
  stack?: string;
}

export interface StackFrame {
  text: string;
  /** node_modules 안의 호출 */
  library: boolean;
}

/**
 * 메시지를 먼저 보여주므로 V8 stack 첫머리의 `Name: message` 반복을 뺀 호출 위치 목록
 * dev server origin과 Vite의 `?v=` 캐시 쿼리를 지워 프로젝트 경로만 남김
 */
export function stackFrames(failure: PreviewFailure, origin: string): StackFrame[] {
  const stack = failure.stack ?? "";
  const headerEnd = failure.message ? stack.indexOf(failure.message) : -1;
  const body = headerEnd >= 0 ? stack.slice(headerEnd + failure.message.length) : stack;
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => ({
      text: line.replaceAll(`${origin}/`, "").replace(/\?v=[\w-]+/g, ""),
      library: line.includes("/node_modules/"),
    }));
}
