import { useEffect, useState, type ComponentType } from "react";
import { getPreviewConfig, type PreviewConfig } from "@vitrine/vite-plugin/preview";
import { mergeControls, resolveInitialArgs } from "../components/Controls";

export interface PreviewVariantOption {
  key: string;
  name: string;
}

interface PreviewCanvasState {
  Comp: ComponentType | null;
  error: Error | null;
  controls: ReturnType<typeof mergeControls>;
  args: Record<string, unknown>;
  setArg: (name: string, value: unknown) => void;
  variants: PreviewVariantOption[];
  variantKey: string | undefined;
  setVariant: (key: string) => void;
}

// registered.args 위에 선택된 variant의 args를 얹어 args를 (재)계산, variant
// 전환은 사용자가 직접 고친 값까지 포함해 그 variant의 프리셋으로 되돌림
function computeArgs(
  controls: Record<string, GalleryPropControl>,
  config: PreviewConfig<ComponentType>,
  variantKey: string | undefined,
): Record<string, unknown> {
  const variantArgs = variantKey ? config.variants?.[variantKey]?.args : undefined;
  return resolveInitialArgs(
    controls,
    config.args as Record<string, unknown> | undefined,
    variantArgs as Record<string, unknown> | undefined,
  );
}

/** entry 변경마다 모듈 로딩, registry 조회, 초기 args 계산을 다시 수행 */
export const usePreviewCanvas = (entry: GalleryPreviewEntry | undefined): PreviewCanvasState => {
  const [Comp, setComp] = useState<ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [config, setConfig] = useState<PreviewConfig<ComponentType>>({});
  const [args, setArgs] = useState<Record<string, unknown>>({});
  const [variantKey, setVariantKey] = useState<string | undefined>(undefined);

  useEffect(() => {
    setComp(null);
    setError(null);
    setConfig({});
    setArgs({});
    setVariantKey(undefined);
    if (!entry) return;

    let cancelled = false;
    const load = async () => {
      try {
        const mod = await entry.load();
        if (cancelled) return;
        const found = mod[entry.exportName];
        if (typeof found !== "function") {
          setError(new Error(`"${entry.exportName}" in ${entry.file} is not a component (got ${typeof found}).`));
          return;
        }
        const component = found as ComponentType;
        const registered = getPreviewConfig(component) ?? {};
        const initialVariant = registered.defaultVariant ?? Object.keys(registered.variants ?? {})[0];
        setConfig(registered);
        setVariantKey(initialVariant);
        setArgs(computeArgs(entry.controls, registered, initialVariant));
        setComp(() => component);
      } catch (err) {
        if (!cancelled) setError(err as Error);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [entry?.id]);

  const controls = mergeControls(
    entry?.controls ?? {},
    config.controls as Parameters<typeof mergeControls>[1],
  );
  const setArg = (name: string, value: unknown) => setArgs((current) => ({ ...current, [name]: value }));
  const setVariant = (key: string) => {
    setVariantKey(key);
    setArgs(computeArgs(entry?.controls ?? {}, config, key));
  };
  const variants = Object.entries(config.variants ?? {}).map(([key, variant]) => ({
    key,
    name: variant.name ?? key,
  }));

  return { Comp, error, controls, args, setArg, variants, variantKey, setVariant };
};
