import type { GalleryViewport } from "@vitrine/protocol";

/** 무대 전체 너비를 쓰는 기본 viewport 이름, plugin 옵션과 상관없이 항상 제공 */
export const RESPONSIVE_VIEWPORT = "Responsive";

/** 이름에 해당하는 고정 너비 viewport, Responsive이거나 지금 목록에 없으면 null */
export function findViewport(name: string, viewports: readonly GalleryViewport[]): GalleryViewport | null {
  if (name === RESPONSIVE_VIEWPORT) return null;
  return viewports.find((viewport) => viewport.name === name) ?? null;
}

/** 선택 목록에 보일 viewport 이름 */
export function viewportLabel(viewport: GalleryViewport): string {
  return `${viewport.name} ${viewport.width}px`;
}
