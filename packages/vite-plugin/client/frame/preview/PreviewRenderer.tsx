import { createElement, type ComponentType } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import type { Args } from "./previewConfig";

interface PreviewRendererProps {
  component: ComponentType;
  args: Args;
  globalWrapper: PreviewWrapper | undefined;
  wrapper: PreviewWrapper | undefined;
}

export const PreviewRenderer = ({
  component,
  args,
  globalWrapper,
  wrapper,
}: PreviewRendererProps) => {
  let content = createElement(component, args);
  if (wrapper) content = createElement(wrapper, undefined, content);
  if (globalWrapper) content = createElement(globalWrapper, undefined, content);
  return content;
};
