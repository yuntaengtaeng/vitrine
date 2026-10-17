import type { GalleryConfig } from "@vitrine/protocol";
import type { ViewportOption, ViewportsOption } from "./index.js";

/** Responsive 외의 기본 viewport */
export const DEFAULT_VIEWPORTS: readonly ViewportOption[] = [
  { name: "Mobile", width: 375 },
  { name: "Tablet", width: 768 },
  { name: "Desktop", width: 1280 },
];

const INVALID_VIEWPORTS_MESSAGE =
  "[vitrine] viewports must return an array of { name, width } with unique non-empty names and positive integer widths. Using the default viewports.";

/** viewports 옵션을 적용한 목록 계산, 함수가 실패하거나 결과가 잘못되면 기본 목록과 안내 메시지 반환 */
export function resolveViewports(option: ViewportsOption | undefined): { viewports: ViewportOption[]; warning?: string } {
  const defaults = DEFAULT_VIEWPORTS.map((viewport) => ({ ...viewport }));
  if (!option) return { viewports: defaults };
  try {
    const result: unknown = option(defaults.map((viewport) => ({ ...viewport })));
    if (isViewportList(result)) return { viewports: result.map(({ name, width }) => ({ name, width })) };
  } catch (error) {
    return { viewports: defaults, warning: `${INVALID_VIEWPORTS_MESSAGE}\n  ${String(error)}` };
  }
  return { viewports: defaults, warning: INVALID_VIEWPORTS_MESSAGE };
}

/** Gallery 설정을 virtual module JS 문자열로 직렬화 */
export function renderGalleryConfigModule(config: GalleryConfig): string {
  return `export default ${JSON.stringify(config)};\n`;
}

function isViewportList(value: unknown): value is ViewportOption[] {
  if (!Array.isArray(value)) return false;
  const names = new Set<string>();
  for (const item of value) {
    if (typeof item !== "object" || item === null) return false;
    const { name, width } = item as Record<string, unknown>;
    if (typeof name !== "string" || name.trim() === "" || names.has(name)) return false;
    if (typeof width !== "number" || !Number.isSafeInteger(width) || width <= 0) return false;
    names.add(name);
  }
  return true;
}
