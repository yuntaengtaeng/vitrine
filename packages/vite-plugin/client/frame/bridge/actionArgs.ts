const MAX_LENGTH = 120;

const truncate = (text: string) => (text.length > MAX_LENGTH ? `${text.slice(0, MAX_LENGTH)}...` : text);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

/** action 호출 인자를 Actions 탭에서 읽을 문자열로, React 이벤트와 DOM 요소는 종류만 남김 */
export function formatActionArg(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "string") return truncate(JSON.stringify(value));
  if (typeof value === "function") return `[function ${value.name || "anonymous"}]`;
  if (!isRecord(value)) return String(value);
  if ("nativeEvent" in value && typeof value.type === "string") return `[event ${value.type}]`;
  if (typeof value.nodeName === "string") return `<${value.nodeName.toLowerCase()}>`;
  try {
    return truncate(JSON.stringify(value));
  } catch {
    // 순환 참조처럼 JSON으로 만들 수 없는 객체
    return `[${value.constructor?.name ?? "object"}]`;
  }
}
