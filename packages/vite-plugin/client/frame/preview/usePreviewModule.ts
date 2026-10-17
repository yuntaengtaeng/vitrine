import { useEffect, useState } from "react";
import { getPreviewConfig } from "vite-plugin-react-vitrine/preview";
import { pickPreviewComponent, type LoadedPreview } from "./previewConfig";

/** entry 모듈을 로드해 컴포넌트와 preview() 설정 제공, entry가 바뀌면 이전 로드 결과는 버림 */
export const usePreviewModule = (
  entry: GalleryPreviewEntry | undefined,
): { preview: LoadedPreview | null; error: Error | null } => {
  const [preview, setPreview] = useState<LoadedPreview | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!entry) return;

    let cancelled = false;
    entry
      .load()
      .then((mod) => {
        if (cancelled) return;
        const component = pickPreviewComponent(mod, entry);
        setError(null);
        setPreview({ component, config: getPreviewConfig(component) ?? {} });
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      });

    return () => {
      cancelled = true;
    };
  }, [entry]);

  return { preview, error };
};
