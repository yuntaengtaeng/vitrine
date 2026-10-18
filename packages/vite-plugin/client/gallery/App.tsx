import { VARIANT_SAVE_CAPABILITY, type GalleryConfig } from "@vitrine/protocol";
import { useEffect, useRef, useState } from "react";
import * as styles from "./App.css";
import { usePreviewSelectionSync } from "./usePreviewSelectionSync";
import { useStageSettings } from "./features/stage/useStageSettings";
import { useFailedPreviews } from "./useFailedPreviews";
import { Sidebar } from "./features/sidebar/Sidebar";
import { SidebarItem } from "./features/sidebar/SidebarItem";
import { Canvas } from "./Canvas";
import { canvasLayers } from "./canvasLayers";
import { EmptyGallery } from "./features/emptyState/EmptyGallery";
import { UpdateNotice } from "./features/hostNotice/UpdateNotice";
import { useColorTheme } from "./useColorTheme";
import { useHostCapabilities } from "./useHostCapabilities";
import { decodeStateLink } from "./stateLink";
import { isEmbeddedInFrame } from "./shared/editorLink";
import { MenuIcon } from "./shared/icons/MenuIcon";

/** Gallery UI, 사용자 코드는 실행하지 않고 프리뷰 렌더링은 iframe frame에 맡김 (ADR 007) */
export const App = (props: { entries: GalleryPreviewEntry[]; config: GalleryConfig }) => {
  const { entries } = props;
  // 처음 연 URL의 상태 링크는 그 프리뷰를 처음 보여줄 때 한 번만 적용
  const [pendingLink, setPendingLink] = useState(() => decodeStateLink(window.location.hash));
  const [activeId, setActiveId] = usePreviewSelectionSync(entries, pendingLink?.previewId);
  // 화면에 보이는 프리뷰, 새로 고른 프리뷰의 frame이 준비되면 그쪽으로 바뀜
  const [shownId, setShownId] = useState(activeId);
  const [embedded] = useState(() => isEmbeddedInFrame(window));
  // VS Code panel 안에서는 옆에 에디터가 있고, 바깥에서 에디터를 실행하면 새 창이 뜰 수 있어 숨김
  const canOpenInEditor = !embedded;
  const host = useHostCapabilities(embedded);
  useColorTheme(embedded, host);
  // 프리뷰를 바꿔도 같은 배경과 너비로 비교할 수 있게 Canvas 밖에서 보관
  const [stage, updateStage] = useStageSettings();
  const [failedIds, markFailed] = useFailedPreviews();
  // 좁은 패널에서만 의미가 있고, 넓은 화면에서는 CSS가 서랍 상태를 무시
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  // 서랍을 연 키보드 사용자가 바로 검색하고 Escape로 닫을 수 있게 포커스를 안으로 옮김
  useEffect(() => {
    if (sidebarOpen) sidebarRef.current?.querySelector<HTMLElement>("input, button")?.focus();
  }, [sidebarOpen]);
  const selectPreview = (id: string) => {
    setActiveId(id);
    setPendingLink(null);
    setSidebarOpen(false);
  };

  return (
    <div className={styles.root}>
      <div
        ref={sidebarRef}
        className={styles.sidebarSlot}
        data-open={sidebarOpen}
        onKeyDown={(event) => {
          if (event.key === "Escape") setSidebarOpen(false);
        }}
      >
        <Sidebar
          entries={entries}
          renderEntry={(entry) => (
            <SidebarItem
              entry={entry}
              isActive={entry.id === activeId}
              failed={failedIds.has(entry.id)}
              onSelect={selectPreview}
            />
          )}
        />
      </div>
      <div className={styles.backdrop} hidden={!sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <div className={styles.main}>
        {host?.outdated && <UpdateNotice outdated={host.outdated} />}
        <div className={styles.narrowBar}>
          <button
            type="button"
            className={styles.menuButton}
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <MenuIcon size={14} />
            Previews
          </button>
        </div>
        <div className={styles.canvas}>
        {entries.length === 0 && <EmptyGallery include={props.config.include} />}
        {canvasLayers(entries, shownId, activeId).map(({ entry, pending }) => (
          // 층이 바뀌어도 key가 같아 다시 마운트하지 않음
          <div
            key={entry.id}
            className={pending ? styles.pendingLayer : styles.layer}
            aria-hidden={pending || undefined}
            data-canvas-pending={pending || undefined}
          >
            <Canvas
              entry={entry}
              canOpenInEditor={canOpenInEditor}
              viewports={props.config.viewports}
              stage={stage}
              onStageChange={updateStage}
              onFailedChange={markFailed}
              onSettled={setShownId}
              link={pendingLink?.previewId === entry.id ? pendingLink : undefined}
              snapshotsEnabled={props.config.snapshots}
              canSaveVariant={host?.supported[VARIANT_SAVE_CAPABILITY] !== undefined}
            />
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};
