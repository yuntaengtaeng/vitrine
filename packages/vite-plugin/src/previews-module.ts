import type { GalleryEntryData } from "@vitrine/protocol";
import type { PreviewSetupModule } from "./preview-setup.js";
import type { PreviewEntry } from "./scan.js";

/** 스캔 entry에서 Gallery로 넘길 필드만 추출 */
export function toGalleryEntry(entry: PreviewEntry): GalleryEntryData {
  const { id, name, group, file, exportName, controls, actions } = entry;
  return { id, name, group, file, exportName, controls, actions };
}

/** 스캔된 프리뷰 목록과 setup module loader를 가상 모듈 JS 문자열로 직렬화 */
export function renderPreviewsModule(entries: PreviewEntry[], setup?: PreviewSetupModule): string {
  const items = entries.map(
    (entry) =>
      `  { ...${JSON.stringify(toGalleryEntry(entry))}, load: () => import(${JSON.stringify("/" + entry.file)}) }`,
  );
  return `${renderPreviewSetupLoader(setup)}\nexport default [\n${items.join(",\n")}\n];\n`;
}

// 없는 파일을 import로 내보내면 Vite import 분석이 previews module 전체를 실패시킴
function renderPreviewSetupLoader(setup: PreviewSetupModule | undefined): string {
  if (!setup) return "export const loadPreviewSetup = undefined;";
  if (setup.status === "unavailable") {
    return `export const loadPreviewSetup = () => Promise.reject(new Error(${JSON.stringify(setup.message)}));`;
  }
  return `export const loadPreviewSetup = () => import(${JSON.stringify(setup.importPath)});`;
}
