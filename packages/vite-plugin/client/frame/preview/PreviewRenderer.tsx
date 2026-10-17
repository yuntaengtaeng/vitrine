import type { FrameGlobalValues } from "@vitrine/protocol";
import { createElement, Fragment, type ComponentType } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import type { Args } from "./previewConfig";

interface PreviewRendererProps {
  component: ComponentType;
  args: Args;
  globalWrapper: PreviewWrapper | undefined;
  wrapper: PreviewWrapper | undefined;
  globals: FrameGlobalValues;
}

export const PreviewRenderer = ({
  component,
  args,
  globalWrapper,
  wrapper,
  globals,
}: PreviewRendererProps) => {
  let content = createElement(component, args);
  if (wrapper) content = createElement(wrapper, { globals, children: content });
  if (globalWrapper) content = createElement(globalWrapper, { globals, children: content });
  // Provider는 처음 마운트할 때만 값을 읽는 경우가 많아 globals가 바뀌면 wrapper부터 새로 마운트
  return createElement(Fragment, { key: JSON.stringify(globals) }, content);
};
