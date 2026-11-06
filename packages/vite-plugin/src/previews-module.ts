import { PREVIEW_SETUP_MODULE_ID, PREVIEW_SETUP_UPDATED_EVENT, type GalleryEntryData } from "@vitrine/protocol";
import type { PreviewSetupModule } from "./preview-setup.js";
import type { PreviewEntry } from "./scan.js";

/** 스캔 entry에서 Gallery로 넘길 필드만 추출 */
export function toGalleryEntry(entry: PreviewEntry): GalleryEntryData {
  const { id, name, group, file, exportName, controls, actions } = entry;
  return { id, name, group, file, exportName, controls, actions };
}

/** 스캔된 프리뷰 목록을 가상 모듈 JS 문자열로 직렬화, setup loader는 setup 가상 모듈에서 다시 export */
export function renderPreviewsModule(entries: PreviewEntry[]): string {
  const items = entries.map(
    (entry) =>
      `  { ...${JSON.stringify(toGalleryEntry(entry))}, load: () => import(${JSON.stringify("/" + entry.file)}) }`,
  );
  return `export { loadPreviewSetup } from ${JSON.stringify(PREVIEW_SETUP_MODULE_ID)};\nexport default [\n${items.join(",\n")}\n];\n`;
}

/**
 * setup file loader를 담은 가상 모듈 JS 문자열 생성
 *
 * globals 같은 컴포넌트가 아닌 export 때문에 React Refresh가 setup module을 갱신 경계로 쓰지 못하므로,
 * 이 모듈이 갱신을 받아 멈추지 않으면 Vite가 앱 page까지 full reload함
 */
export function renderPreviewSetupModule(setup?: PreviewSetupModule): string {
  // @preview 파일 갱신까지 삼키지 않도록 accept는 previews module이 아니라 이 모듈에만 둠
  return `${renderPreviewSetupLoader(setup)}
if (import.meta.hot) {
  import.meta.hot.accept((next) => {
    if (next) window.dispatchEvent(new CustomEvent(${JSON.stringify(PREVIEW_SETUP_UPDATED_EVENT)}, { detail: next.loadPreviewSetup }));
  });
}
`;
}

// 없는 파일을 import로 내보내면 Vite import 분석이 module 전체를 실패시킴
function renderPreviewSetupLoader(setup: PreviewSetupModule | undefined): string {
  if (!setup) return "export const loadPreviewSetup = undefined;";
  if (setup.status === "unavailable") {
    return `export const loadPreviewSetup = () => Promise.reject(new Error(${JSON.stringify(setup.message)}));`;
  }
  return `export const loadPreviewSetup = () => import(${JSON.stringify(setup.importPath)});`;
}
