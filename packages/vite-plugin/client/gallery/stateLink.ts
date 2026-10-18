import type { FrameArgs, FrameGlobalValues } from "@vitrine/protocol";

/** URL hash에 담는 Gallery 상태, 함수와 JSX처럼 직렬화할 수 없는 값은 담지 않음 */
export interface StateLink {
  previewId: string;
  variantKey: string | null;
  /** 사용자가 바꾼 값만 */
  args: FrameArgs;
  globals: FrameGlobalValues;
}

const isArgValue = (value: unknown) =>
  value === null ||
  typeof value === "string" ||
  typeof value === "boolean" ||
  (typeof value === "number" && Number.isFinite(value));

function parseRecord<T>(raw: string | null, isValue: (value: unknown) => boolean): Record<string, T> {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, item]) => isValue(item))) as Record<string, T>;
  } catch {
    return {};
  }
}

export function encodeStateLink(link: StateLink): string {
  const params = new URLSearchParams({ preview: link.previewId });
  if (link.variantKey) params.set("variant", link.variantKey);
  if (Object.keys(link.args).length > 0) params.set("args", JSON.stringify(link.args));
  if (Object.keys(link.globals).length > 0) params.set("globals", JSON.stringify(link.globals));
  return `#${params.toString()}`;
}

/** 손으로 고친 링크도 열 수 있게 읽을 수 없는 값은 버리고 나머지만 복원, 프리뷰가 없으면 null */
export function decodeStateLink(hash: string): StateLink | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const previewId = params.get("preview");
  if (!previewId) return null;
  return {
    previewId,
    variantKey: params.get("variant"),
    args: parseRecord(params.get("args"), isArgValue),
    globals: parseRecord(params.get("globals"), (value) => typeof value === "string"),
  };
}
