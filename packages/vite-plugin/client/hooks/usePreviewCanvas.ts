import { useEffect, useState, type ComponentType, type ElementType } from "react";
import { getPreviewConfig, type PreviewConfig } from "@vitrine/vite-plugin/preview";
import {
  getInitialVariantKey,
  isPreviewComponent,
  mergeControls,
  resolveVariantArgs,
  toVariantOptions,
  type Args,
  type ControlsMap,
  type PreviewVariantOption,
} from "../components/previewConfig";

interface LoadedPreview {
  Comp: ComponentType;
  config: PreviewConfig<ElementType>;
}

interface PreviewCanvasState {
  Comp: ComponentType | null;
  error: Error | null;
  controls: ControlsMap;
  args: Args;
  setArg: (name: string, value: unknown) => void;
  variants: PreviewVariantOption[];
  variantKey: string | undefined;
  setVariant: (key: string) => void;
}

/** entry의 모듈을 로드해 컴포넌트, preview() 설정, variant별 args 상태 제공 */
export const usePreviewCanvas = (entry: GalleryPreviewEntry | undefined): PreviewCanvasState => {
  const [loaded, setLoaded] = useState<LoadedPreview | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [variantKey, setVariantKey] = useState<string | undefined>(undefined);
  const [args, setArgs] = useState<Args>({});

  useEffect(() => {
    if (!entry) return;

    let cancelled = false;
    entry
      .load()
      .then((mod) => {
        if (cancelled) return;
        const component = mod[entry.exportName];
        if (!isPreviewComponent(component)) {
          setError(new Error(`"${entry.exportName}" in ${entry.file} is not a component (got ${typeof component}).`));
          return;
        }
        const config = getPreviewConfig(component) ?? {};
        const initialVariant = getInitialVariantKey(config);
        setError(null);
        setLoaded({ Comp: component, config });
        setVariantKey(initialVariant);
        setArgs(resolveVariantArgs(entry.controls, config, initialVariant));
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, [entry]);

  const config = loaded?.config ?? {};
  const inferredControls = entry?.controls ?? {};

  return {
    Comp: loaded?.Comp ?? null,
    error,
    controls: mergeControls(inferredControls, config.controls),
    args,
    setArg: (name, value) => setArgs((current) => ({ ...current, [name]: value })),
    variants: toVariantOptions(config),
    variantKey,
    setVariant: (key) => {
      setVariantKey(key);
      setArgs(resolveVariantArgs(inferredControls, config, key));
    },
  };
};
