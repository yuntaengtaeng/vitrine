import { SNAPSHOT_QUERY } from "@vitrine/protocol";
import { useEffect, useState } from "react";
import { getPreviewConfig } from "vite-plugin-react-vitrine/preview";
import { pickPreviewComponent, type LoadedPreview } from "./previewConfig";

/**
 * entry 모듈을 로드해 컴포넌트와 preview() 설정 제공, entry가 바뀌면 이전 로드 결과는 버림
 * snapshot이 있으면 dev server가 보관한 그 번호의 옛 버전을 로드 (ADR 010)
 */
export const usePreviewModule = (
  entry: GalleryPreviewEntry | undefined,
  snapshot?: number,
): { preview: LoadedPreview | null; error: Error | null } => {
  const [preview, setPreview] = useState<LoadedPreview | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!entry) return;

    let cancelled = false;
    const load = snapshot
      ? () => import(/* @vite-ignore */ `/${entry.file}?${SNAPSHOT_QUERY}=${snapshot}`) as Promise<Record<string, unknown>>
      : entry.load;
    load()
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
  }, [entry, snapshot]);

  // Fast Refresh는 컴포넌트 코드만 바꾸고 preview() 설정은 새 모듈의 컴포넌트에 등록되므로,
  // 파일이 갱신되면 Vite가 이미 실행한 같은 URL에서 설정만 다시 읽고 컴포넌트와 그 state는 유지
  useEffect(() => {
    const hot = import.meta.hot;
    if (!entry || snapshot || !hot) return;
    const path = `/${entry.file}`;
    const onUpdate = (payload: { updates: { path: string; timestamp: number }[] }) => {
      const update = payload.updates.find((candidate) => candidate.path === path);
      if (!update) return;
      (import(/* @vite-ignore */ `${path}?t=${update.timestamp}`) as Promise<Record<string, unknown>>)
        .then((mod) => {
          const config = getPreviewConfig(pickPreviewComponent(mod, entry)) ?? {};
          setPreview((current) => current && { component: current.component, config });
        })
        // 갱신된 모듈이 깨졌으면 Fast Refresh와 에러 경계가 알리므로 설정은 그대로 둠
        .catch(() => undefined);
    };
    hot.on("vite:afterUpdate", onUpdate);
    return () => hot.off("vite:afterUpdate", onUpdate);
  }, [entry, snapshot]);

  return { preview, error };
};
