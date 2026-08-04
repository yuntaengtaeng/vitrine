import { useEffect, useState, type ComponentType } from "react";
import { ErrorText } from "./ErrorText";
import { PreviewErrorBoundary } from "./PreviewErrorBoundary";

export const Canvas = (props: { entry: GalleryPreviewEntry | undefined }) => {
  const { entry } = props;
  const [Comp, setComp] = useState<ComponentType | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setComp(null);
    setError(null);
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
        setComp(() => found as ComponentType);
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
  return (
    <PreviewErrorBoundary>
      <Comp />
    </PreviewErrorBoundary>
  );
};
