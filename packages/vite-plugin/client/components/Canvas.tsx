import { useEffect, useState, type ComponentType, type CSSProperties } from "react";
import { getPreviewConfig, type PreviewConfig } from "@vitrine/vite-plugin/preview";
import { ErrorText } from "./ErrorText";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";
import { Controls, mergeControls } from "./Controls";

const Styled = {
  Root: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    height: "100%",
  } satisfies CSSProperties,
  Preview: {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    overflow: "auto",
    padding: "2.5rem",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    boxSizing: "border-box",
  } satisfies CSSProperties,
  PreviewBody: { padding: "2rem", minWidth: 200, minHeight: 80, boxSizing: "border-box" } satisfies CSSProperties,
};

export const Canvas = (props: { entry: GalleryPreviewEntry | undefined }) => {
  const { entry } = props;
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
        const defaults = Object.fromEntries(
          Object.entries(entry.controls)
            .filter(([, control]) => control.defaultValue !== undefined)
            .map(([name, control]) => [name, control.defaultValue]),
        );
        setConfig(registered);
        setArgs({ ...defaults, ...(registered.args as Record<string, unknown> | undefined) });
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

  if (error) return <ErrorText>{String(error.stack ?? error.message ?? error)}</ErrorText>;
  if (!Comp) return null;
  const controls = mergeControls(
    entry?.controls ?? {},
    config.controls as Parameters<typeof mergeControls>[1],
  );
  return (
    <div style={Styled.Root}>
      <div style={Styled.Preview}>
        <div style={Styled.PreviewBody}>
          <PreviewErrorBoundary>
            <Comp {...args} />
          </PreviewErrorBoundary>
        </div>
      </div>
      <Controls
        controls={controls}
        args={args}
        onChange={(name, value) => setArgs((current) => ({ ...current, [name]: value }))}
      />
    </div>
  );
};
