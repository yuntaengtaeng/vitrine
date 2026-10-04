/// <reference types="vite/client" />
import { PREVIEW_SETUP_RECOVER_EVENT } from "@vitrine/protocol";
import { useEffect, useState } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import { isPreviewComponent } from "../components/previewConfig";

type PreviewSetupLoader = (() => Promise<{ default?: unknown }>) | undefined;

interface PreviewSetupState {
  wrapper: PreviewWrapper | undefined;
  error: Error | null;
  loading: boolean;
}

/** 갤러리 복구에 필요한 Vite HMR client의 최소 형태 */
export interface HotUpdateSource {
  on(event: string, listener: () => void): void;
  off(event: string, listener: () => void): void;
}

// Vite 갱신은 이미 로드된 적 있는 setup, custom event는 처음부터 분석되지 못한 setup의 수정 신호
const RECOVERY_EVENTS = ["vite:beforeUpdate", PREVIEW_SETUP_RECOVER_EVENT];

/**
 * 다음 HMR 갱신 또는 setup 복구 신호에서 갤러리 reload 예약, 구독 해제 함수 반환
 *
 * 평가에 실패한 setup module은 HMR 경계가 없어 갱신만으로 복구 불가
 */
export const reloadOnNextHotUpdate = (
  hot: HotUpdateSource | undefined,
  reload: () => void,
): (() => void) => {
  if (!hot) return () => {};
  for (const event of RECOVERY_EVENTS) hot.on(event, reload);
  return () => {
    for (const event of RECOVERY_EVENTS) hot.off(event, reload);
  };
};

/** Setup module의 default wrapper 로드와 runtime 검증, 실패 시 다음 갱신에서 reload */
export const usePreviewSetup = (loadSetup: PreviewSetupLoader): PreviewSetupState => {
  const [state, setState] = useState<PreviewSetupState>({
    wrapper: undefined,
    error: null,
    loading: Boolean(loadSetup),
  });

  useEffect(() => {
    if (!loadSetup) return;

    let cancelled = false;
    loadSetup()
      .then((module) => {
        if (cancelled) return;
        if (!isPreviewComponent(module.default)) {
          throw new Error("Vitrine setupFile must default export a React wrapper component");
        }
        setState({ wrapper: module.default as PreviewWrapper, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          wrapper: undefined,
          error: error instanceof Error ? error : new Error(String(error)),
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [loadSetup]);

  const failed = state.error !== null;
  useEffect(() => {
    if (!failed) return;
    return reloadOnNextHotUpdate(import.meta.hot, () => window.location.reload());
  }, [failed]);

  return state;
};
