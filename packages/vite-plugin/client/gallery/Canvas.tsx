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
import { encodeStateLink, type StateLink } from "./stateLink";
import { openInEditor } from "./shared/editorLink";

export const Canvas = (props: {
  entry: GalleryPreviewEntry;
  canOpenInEditor: boolean;
  viewports: readonly GalleryViewport[];
  stage: StageSettings;
  onStageChange: (patch: Partial<StageSettings>) => void;
  onFailedChange: (previewId: string, failed: boolean) => void;
  /** 이 프리뷰를 상태 링크로 연 경우 그 상태 */
  link?: StateLink;
}) => {
  const { entry, onFailedChange, onStageChange } = props;
  const viewId = props.stage.view;
  // 보기 사용 가능 여부는 frame이 알려준 variant 목록에 달려 있어 보낼 때 정함
  const layoutFor = useCallback<LayoutFor>(
    (state) => resolveView(VIEWS, viewId, state.variants).layout(state),
    [viewId],
  );
  const [globals, chooseGlobal] = useGlobalSelection(props.link?.globals);
  const session = usePreviewSession(layoutFor, globals, props.link);
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

  // 주소가 늘 지금 상태를 가리켜 새로고침과 Copy link가 같은 화면을 엶, 방문 기록은 쌓지 않음
  // frame 준비 전에 쓰면 링크로 연 variant와 값을 복원하기 전에 지워짐
  const started = ready !== null;
  const variantKey = session.activeVariantKey ?? null;
  const { overrides } = session;
  useEffect(() => {
    if (!started) return;
    const hash = encodeStateLink({ previewId: entry.id, variantKey, args: overrides, globals });
    window.history.replaceState(null, "", hash);
  }, [started, entry.id, variantKey, overrides, globals]);

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
