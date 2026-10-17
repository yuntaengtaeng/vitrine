import type { FrameGlobal, FrameGlobalValues } from "@vitrine/protocol";
import type { ElementType } from "react";
import type { PreviewConfig } from "vite-plugin-react-vitrine/preview";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** setup file의 `globals` export 검증, 틀리면 무엇이 틀렸는지 담은 Error throw */
export function parseGlobals(value: unknown): Record<string, FrameGlobal> {
  if (value === undefined) return {};
  if (!isRecord(value)) throw new Error("Vitrine setupFile globals must be an object of { options } declarations");
  return Object.fromEntries(
    Object.entries(value).map(([name, declaration]) => {
      const options = isRecord(declaration) ? declaration.options : undefined;
      if (!Array.isArray(options) || options.length === 0 || !options.every((option) => typeof option === "string")) {
        throw new Error(`Vitrine global "${name}" needs options as a non-empty array of strings`);
      }
      const record = declaration as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label : name;
      const defaultValue = record.default ?? options[0];
      if (typeof defaultValue !== "string" || !options.includes(defaultValue)) {
        throw new Error(`Vitrine global "${name}" default must be one of its options`);
      }
      return [name, { label, options: [...options], defaultValue }];
    }),
  );
}

/** preview()와 variant가 고정한 globals, variant 값이 이김 */
export function fixedGlobals(config: PreviewConfig<ElementType>, variantKey: string | undefined): FrameGlobalValues {
  const variantGlobals = variantKey ? config.variants?.[variantKey]?.globals : undefined;
  return { ...config.globals, ...variantGlobals };
}
