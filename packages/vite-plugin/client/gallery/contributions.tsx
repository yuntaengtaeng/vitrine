import type { FrameGlobalValues, FrameLayout, GalleryViewport } from "@vitrine/protocol";
import type { ComponentType } from "react";
import { ActionsLog, ClearActionsButton } from "./features/actions/ActionsLog";
import { CodePanel } from "./features/code/CodePanel";
import { ControlsPanel, ResetAllButton } from "./features/controls/ControlsPanel";
import { VariantPicker } from "./features/controls/VariantPicker";
import { GlobalsPicker } from "./features/globals/GlobalsPicker";
import { matrixAxes, planMatrix, resolveMatrixAxes, type MatrixChoice } from "./features/matrix/matrix";
import { MatrixAxesPicker } from "./features/matrix/MatrixAxesPicker";
import type { LayoutInput } from "./features/previewSession/frameLink";
import type { usePreviewSession } from "./features/previewSession/usePreviewSession";
import { BackgroundPicker } from "./features/stage/background/BackgroundPicker";
import type { StageSettings } from "./features/stage/stageSettings";
import { ViewportPicker } from "./features/stage/viewport/ViewportPicker";
import { singleLayout, variantsLayout } from "./features/views/viewLayouts";

// 기능 폴더는 등록을 모르는 컴포넌트와 순수 함수만 내보내고, 화면 자리 배치는 여기서만 정함 (ADR 008)

export interface ContributionProps {
  entry: GalleryPreviewEntry;
  session: ReturnType<typeof usePreviewSession>;
  /** 지금 프리뷰에서 실제로 보이는 보기 */
  viewId: string;
  stage: StageSettings;
  viewports: readonly GalleryViewport[];
  onStageChange: (patch: Partial<StageSettings>) => void;
  /** toolbar에서 고른 globals */
  globals: FrameGlobalValues;
  onGlobalChange: (name: string, value: string) => void;
  matrix: MatrixChoice;
  onMatrixChange: (choice: MatrixChoice) => void;
}

/** 보기가 배치를 만들 때 쓰는 사용자 설정 */
export interface ViewSettings {
  matrix: MatrixChoice;
}

export interface GalleryView {
  id: string;
  label: string;
  available: (input: Pick<LayoutInput, "variants" | "controls">) => boolean;
  layout: (input: LayoutInput, settings: ViewSettings) => FrameLayout;
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
  /** 없으면 모든 프리뷰에서 보임 */
  available?: (entry: GalleryPreviewEntry) => boolean;
  Actions?: ComponentType<ContributionProps>;
}

const matrixLayout = (input: LayoutInput, settings: ViewSettings): FrameLayout => {
  const plan = planMatrix(matrixAxes(input.controls), settings.matrix, input);
  // 칸이 너무 많으면 frame에는 아무것도 그리지 않고 무대에 안내를 보여줌
  return plan.kind === "ready" ? plan.layout : { kind: "grid", cells: [] };
};

export const VIEWS: readonly GalleryView[] = [
  { id: "single", label: "Single", available: () => true, layout: singleLayout },
  { id: "variants", label: "Variants", available: ({ variants }) => variants.length > 1, layout: variantsLayout },
  { id: "matrix", label: "Matrix", available: ({ controls }) => matrixAxes(controls).length > 0, layout: matrixLayout },
];

/** 고른 보기를 지금 프리뷰에서 쓸 수 없으면 첫 보기 */
export function resolveView(
  views: readonly GalleryView[],
  id: string,
  input: Pick<LayoutInput, "variants" | "controls">,
): GalleryView {
  return views.find((view) => view.id === id && view.available(input)) ?? views[0];
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

const MatrixItem = ({ session, viewId, matrix, onMatrixChange }: ContributionProps) => {
  const { ready } = session.status;
  if (viewId !== "matrix" || !ready) return null;
  const axes = matrixAxes(ready.controls);
  const resolved = resolveMatrixAxes(axes, matrix);
  if (!resolved) return null;
  return (
    <MatrixAxesPicker
      axes={axes}
      rows={resolved.rows.name}
      columns={resolved.columns?.name ?? null}
      onChange={onMatrixChange}
    />
  );
};

const BackgroundItem = ({ stage, onStageChange }: ContributionProps) => (
  <BackgroundPicker value={stage.background} onChange={(background) => onStageChange({ background })} />
);

const ViewportItem = ({ stage, viewports, onStageChange }: ContributionProps) => (
  <ViewportPicker value={stage.viewport} viewports={viewports} onChange={(viewport) => onStageChange({ viewport })} />
);

export const TOOLBAR_ITEMS: readonly GalleryToolbarItem[] = [
  { id: "variant", align: "start", Item: VariantItem },
  { id: "matrix", align: "start", Item: MatrixItem },
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

const ActionsTab = ({ entry, session }: ContributionProps) => (
  <ActionsLog calls={session.status.actions} names={entry.actions ?? []} />
);

const ActionsTabActions = ({ session }: ContributionProps) =>
  session.status.actions.length > 0 ? <ClearActionsButton onClear={session.clearActions} /> : null;

export const PANEL_TABS: readonly GalleryPanelTab[] = [
  { id: "props", label: "Props", Panel: PropsPanel, Actions: PropsActions },
  {
    id: "actions",
    label: "Actions",
    Panel: ActionsTab,
    available: (entry) => (entry.actions ?? []).length > 0,
    Actions: ActionsTabActions,
  },
  { id: "code", label: "Code", Panel: CodeTab },
];
