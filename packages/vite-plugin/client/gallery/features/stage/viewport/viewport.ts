import type { GalleryViewport } from "@vitrine/protocol";

export const RESPONSIVE_VIEWPORT = "Responsive";

export function findViewport(name: string, viewports: readonly GalleryViewport[]): GalleryViewport | null {
  if (name === RESPONSIVE_VIEWPORT) return null;
  return viewports.find((viewport) => viewport.name === name) ?? null;
}

export function viewportLabel(viewport: GalleryViewport): string {
  return `${viewport.name} ${viewport.width}px`;
}
