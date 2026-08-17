import { useEffect, useState, type ComponentType } from "react";
import { getPreviewConfig, type PreviewConfig } from "@vitrine/vite-plugin/preview";
import { mergeControls, resolveInitialArgs } from "../components/Controls";

interface PreviewCanvasState {
  Comp: ComponentType | null;
  error: Error | null;
  controls: ReturnType<typeof mergeControls>;
  args: Record<string, unknown>;
  setArg: (name: string, value: unknown) => void;
}

/** entry 변경마다 모듈 로딩, registry 조회, 초기 args 계산을 다시 수행 */
export const usePreviewCanvas = (entry: GalleryPreviewEntry | undefined): PreviewCanvasState => {
  const [Comp, setComp] = useState<ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [config, setConfig] = useState<PreviewConfig<ComponentType>>({});
  const [args, setArgs] = useState<Record<string, unknown>>({});

  useEffect(() => {
    setComp(null);
    setError(null);
    setConfig({});
    setArgs({});
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
        setConfig(registered);
        setArgs(resolveInitialArgs(entry.controls, registered.args as Record<string, unknown> | undefined));
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

  return { Comp, error, controls, args, setArg };
};
