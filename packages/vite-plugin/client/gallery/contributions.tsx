import type { FrameGlobalValues, FrameVariant, GalleryViewport } from "@vitrine/protocol";
import type { ComponentType } from "react";
import { CodePanel } from "./features/code/CodePanel";
import { ControlsPanel, ResetAllButton } from "./features/controls/ControlsPanel";
import { VariantPicker } from "./features/controls/VariantPicker";
import { GlobalsPicker } from "./features/globals/GlobalsPicker";
import type { LayoutFor } from "./features/previewSession/frameLink";
import type { usePreviewSession } from "./features/previewSession/usePreviewSession";
import { BackgroundPicker } from "./features/stage/background/BackgroundPicker";
import type { StageSettings } from "./features/stage/stageSettings";
import { ViewportPicker } from "./features/stage/viewport/ViewportPicker";
import { singleLayout, variantsLayout } from "./features/views/viewLayouts";

// 기능 폴더는 등록을 모르는 컴포넌트와 순수 함수만 내보내고, 화면 자리 배치는 여기서만 정함 (ADR 008)

export interface ContributionProps {
  session: ReturnType<typeof usePreviewSession>;
  /** 지금 프리뷰에서 실제로 보이는 보기 */
  viewId: string;
  stage: StageSettings;
  viewports: readonly GalleryViewport[];
  onStageChange: (patch: Partial<StageSettings>) => void;
  /** toolbar에서 고른 globals */
  globals: FrameGlobalValues;
  onGlobalChange: (name: string, value: string) => void;
}

export interface GalleryView {
  id: string;
  label: string;
  available: (variants: readonly FrameVariant[]) => boolean;
  layout: LayoutFor;
}

export interface GalleryToolbarItem {
  id: string;
  align: "start" | "end";
  Item: ComponentType<ContributionProps>;
}

export interface GalleryPanelTab {
  id: string;
  label: string;
  Panel: ComponentType<ContributionProps>;
  Actions?: ComponentType<ContributionProps>;
}

export const VIEWS: readonly GalleryView[] = [
  { id: "single", label: "Single", available: () => true, layout: singleLayout },
  { id: "variants", label: "Variants", available: (variants) => variants.length > 1, layout: variantsLayout },
];

/** 고른 보기를 지금 프리뷰에서 쓸 수 없으면 첫 보기 */
export function resolveView(views: readonly GalleryView[], id: string, variants: readonly FrameVariant[]): GalleryView {
  return views.find((view) => view.id === id && view.available(variants)) ?? views[0];
}

const VariantItem = ({ session, viewId }: ContributionProps) =>
  viewId === "variants" ? null : (
    <VariantPicker
      variants={session.status.ready?.variants ?? []}
      activeKey={session.activeVariantKey}
      onSelect={session.selectVariant}
    />
  );

const GlobalsItem = ({ session, globals, onGlobalChange }: ContributionProps) => {
  const { ready } = session.status;
  if (!ready) return null;
  const variantKey = session.activeVariantKey;
  const fixed = variantKey ? (ready.variantFixedGlobals[variantKey] ?? {}) : ready.defaultFixedGlobals;
  return <GlobalsPicker declared={ready.globals} chosen={globals} fixed={fixed} onChange={onGlobalChange} />;
};

const BackgroundItem = ({ stage, onStageChange }: ContributionProps) => (
  <BackgroundPicker value={stage.background} onChange={(background) => onStageChange({ background })} />
);

const ViewportItem = ({ stage, viewports, onStageChange }: ContributionProps) => (
  <ViewportPicker value={stage.viewport} viewports={viewports} onChange={(viewport) => onStageChange({ viewport })} />
);

export const TOOLBAR_ITEMS: readonly GalleryToolbarItem[] = [
  { id: "variant", align: "start", Item: VariantItem },
  { id: "globals", align: "end", Item: GlobalsItem },
  { id: "background", align: "end", Item: BackgroundItem },
  { id: "viewport", align: "end", Item: ViewportItem },
];

const PropsPanel = ({ session }: ContributionProps) => {
  const { ready } = session.status;
  if (!ready || !session.args) return null;
  return (
    <ControlsPanel
      controls={ready.controls}
      args={session.args}
      changed={session.changedArgs}
      onChange={session.changeArg}
      onReset={session.resetArg}
    />
  );
};

const PropsActions = ({ session }: ContributionProps) =>
  session.changedArgs.size > 0 ? <ResetAllButton onResetAll={session.resetAllArgs} /> : null;

const CodeTab = ({ session }: ContributionProps) => {
  const { ready } = session.status;
  if (!ready || !session.args) return null;
  const variantKey = session.activeVariantKey;
  return (
    <CodePanel
      componentName={ready.componentName}
      args={session.args}
      frameOnlyArgs={variantKey ? (ready.variantFrameOnlyArgs[variantKey] ?? []) : ready.defaultFrameOnlyArgs}
    />
  );
};

export const PANEL_TABS: readonly GalleryPanelTab[] = [
  { id: "props", label: "Props", Panel: PropsPanel, Actions: PropsActions },
  { id: "code", label: "Code", Panel: CodeTab },
];
