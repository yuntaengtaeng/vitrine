import type { ComponentProps, ElementType } from "react";

export type PreviewControlType = "text" | "number" | "boolean" | "select" | "radio";

export interface PreviewControl {
  type: PreviewControlType;
  options?: Array<string | number>;
}

export type PreviewControls<Props> = Partial<{
  [Key in keyof Props]: PreviewControlType | PreviewControl;
}>;

export interface PreviewConfig<Component extends ElementType> {
  args?: Partial<ComponentProps<Component>>;
  controls?: PreviewControls<ComponentProps<Component>>;
}

const configs = new WeakMap<object, PreviewConfig<ElementType>>();
type PreviewTarget = object & ElementType;

/** Adds optional sample args and control overrides without wrapping the component. */
export function preview<Component extends PreviewTarget>(
  component: Component,
  config: PreviewConfig<Component>,
): void {
  configs.set(component, config as PreviewConfig<ElementType>);
}

/** Used by Vitrine's gallery after the component module has been evaluated. */
export function getPreviewConfig(component: object): PreviewConfig<ElementType> | undefined {
  return configs.get(component);
}
