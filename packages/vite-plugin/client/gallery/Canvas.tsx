import type { GalleryViewport } from "@vitrine/protocol";
import { useCallback, useEffect } from "react";
import * as styles from "./Canvas.css";
import { PANEL_TABS, TOOLBAR_ITEMS, VIEWS, resolveView, type ContributionProps } from "./contributions";
import type { LayoutFor } from "./features/previewSession/frameLink";
import { usePreviewSession } from "./features/previewSession/usePreviewSession";
import { CanvasHeader } from "./features/header/CanvasHeader";
import { ErrorCard } from "./features/previewError/ErrorCard";
import { LoadingOverlay } from "./features/stage/LoadingOverlay";
import { PreviewStage } from "./features/stage/PreviewStage";
import type { StageSettings } from "./features/stage/stageSettings";
import { PanelTabs } from "./features/panel/PanelTabs";
import { ViewSwitcher } from "./features/views/ViewSwitcher";
import { useGlobalSelection } from "./useGlobalSelection";
import { usePanelTab } from "./usePanelTab";
import { openInEditor } from "./shared/editorLink";

export const Canvas = (props: {
  entry: GalleryPreviewEntry;
  canOpenInEditor: boolean;
  viewports: readonly GalleryViewport[];
  stage: StageSettings;
  onStageChange: (patch: Partial<StageSettings>) => void;
  onFailedChange: (previewId: string, failed: boolean) => void;
}) => {
  const { entry, onFailedChange, onStageChange } = props;
  const viewId = props.stage.view;
  // 보기 사용 가능 여부는 frame이 알려준 variant 목록에 달려 있어 보낼 때 정함
  const layoutFor = useCallback<LayoutFor>(
    (state) => resolveView(VIEWS, viewId, state.variants).layout(state),
    [viewId],
  );
  const [globals, chooseGlobal] = useGlobalSelection();
  const session = usePreviewSession(layoutFor, globals);
  const [tabId, selectTab] = usePanelTab(PANEL_TABS[0].id);
  const activeTab = PANEL_TABS.find((tab) => tab.id === tabId) ?? PANEL_TABS[0];
  const ActivePanel = activeTab.Panel;
  const ActiveActions = activeTab.Actions;
  const { ready, error } = session.status;
  const variants = ready?.variants ?? [];
  const availableViews = VIEWS.filter((view) => view.available(variants));
  const contribution: ContributionProps = {
    session,
    viewId: resolveView(VIEWS, viewId, variants).id,
    stage: props.stage,
    viewports: props.viewports,
    onStageChange,
    globals,
    onGlobalChange: chooseGlobal,
  };

  useEffect(() => onFailedChange(entry.id, error !== null), [entry.id, error, onFailedChange]);

  return (
    <div className={styles.root}>
      <CanvasHeader entry={entry} canOpenInEditor={props.canOpenInEditor} />
      <div className={styles.toolbar}>
        {availableViews.length > 1 && (
          <ViewSwitcher views={availableViews} activeId={contribution.viewId} onSelect={(view) => onStageChange({ view })} />
        )}
        {TOOLBAR_ITEMS.filter((item) => item.align === "start").map(({ id, Item }) => (
          <Item key={id} {...contribution} />
        ))}
        <div className={styles.toolbarEnd}>
          {TOOLBAR_ITEMS.filter((item) => item.align === "end").map(({ id, Item }) => (
            <Item key={id} {...contribution} />
          ))}
        </div>
      </div>
      <PreviewStage
        entry={entry}
        iframeRef={session.iframeRef}
        framePhase={session.status.phase}
        contentHeight={session.status.height}
        settings={props.stage}
        viewports={props.viewports}
        overlay={session.status.phase === "loading" && <LoadingOverlay />}
        fallback={
          error && (
            <ErrorCard
              failure={error}
              onOpenInEditor={props.canOpenInEditor ? () => openInEditor(entry.id) : undefined}
            />
          )
        }
      />
      {ready && (
        <PanelTabs
          tabs={PANEL_TABS}
          activeId={activeTab.id}
          onSelect={selectTab}
          actions={ActiveActions && <ActiveActions {...contribution} />}
        >
          <ActivePanel {...contribution} />
        </PanelTabs>
      )}
    </div>
  );
};
