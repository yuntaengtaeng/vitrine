import type { FrameGlobalValues } from "@vitrine/protocol";
import { createElement, Fragment, type ComponentType } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import type { Args } from "./previewConfig";
import { useActionArgs } from "./useActionArgs";

const NO_ACTIONS: readonly string[] = [];
const ignoreAction = () => {};

interface PreviewRendererProps {
  component: ComponentType;
  args: Args;
  globalWrapper: PreviewWrapper | undefined;
  wrapper: PreviewWrapper | undefined;
  globals: FrameGlobalValues;
  /** 호출을 기록할 함수 prop 이름 */
  actions?: readonly string[];
  onAction?: (name: string, values: unknown[]) => void;
}

export const PreviewRenderer = ({
  component,
  args,
  globalWrapper,
  wrapper,
  globals,
  actions = NO_ACTIONS,
  onAction = ignoreAction,
}: PreviewRendererProps) => {
  const props = useActionArgs(args, actions, onAction);
  let content = createElement(component, props);
  if (wrapper) content = createElement(wrapper, { globals, children: content });
  if (globalWrapper) content = createElement(globalWrapper, { globals, children: content });
  // Provider는 처음 마운트할 때만 값을 읽는 경우가 많아 globals가 바뀌면 wrapper부터 새로 마운트
  return createElement(Fragment, { key: JSON.stringify(globals) }, content);
};
