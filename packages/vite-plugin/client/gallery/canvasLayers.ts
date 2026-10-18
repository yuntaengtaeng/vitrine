export interface CanvasLayer {
  entry: GalleryPreviewEntry;
  /** 아직 frame이 준비되지 않아 보이지 않게 띄워 둔 다음 프리뷰 */
  pending: boolean;
}

/**
 * 프리뷰를 바꿀 때 새 frame이 준비될 때까지 지금 화면을 두고 새 화면은 숨겨서 띄움
 * 보이던 프리뷰가 목록에서 사라졌으면 기다리지 않고 바로 보여줌
 */
export function canvasLayers(
  entries: readonly GalleryPreviewEntry[],
  shownId: string | null,
  activeId: string | null,
): CanvasLayer[] {
  const active = entries.find((entry) => entry.id === activeId);
  const shown = entries.find((entry) => entry.id === shownId);
  if (!active) return shown ? [{ entry: shown, pending: false }] : [];
  if (!shown || shown.id === active.id) return [{ entry: active, pending: false }];
  return [
    { entry: shown, pending: false },
    { entry: active, pending: true },
  ];
}
