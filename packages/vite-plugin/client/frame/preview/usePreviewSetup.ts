/// <reference types="vite/client" />
import { PREVIEW_SETUP_RECOVER_EVENT, PREVIEW_SETUP_UPDATED_EVENT, type FrameGlobal } from "@vitrine/protocol";
import { useEffect, useState } from "react";
import type { PreviewWrapper } from "vite-plugin-react-vitrine/preview";
import { isPreviewComponent } from "./previewConfig";
import { parseGlobals } from "./previewGlobals";

/** setup virtual module의 setup file loader, setupFile 옵션이 없으면 undefined */
export type PreviewSetupLoader = (() => Promise<{ default?: unknown; globals?: unknown }>) | undefined;

/** setup file의 전역 wrapper 로드 상태 */
export interface PreviewSetupState {
  wrapper: PreviewWrapper | undefined;
  globals: Record<string, FrameGlobal>;
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

/** setup 가상 모듈 갱신 event를 받을 대상 */
export type SetupUpdateTarget = Pick<EventTarget, "addEventListener" | "removeEventListener">;

/** Setup module의 default wrapper 로드와 runtime 검증, 실패 시 다음 갱신에서 reload */
export const usePreviewSetup = (
  initialLoader: PreviewSetupLoader,
  updates: SetupUpdateTarget | undefined = globalThis.window,
): PreviewSetupState => {
  const [loadSetup, setLoadSetup] = useState(() => initialLoader);
  const [state, setState] = useState<PreviewSetupState>({
    wrapper: undefined,
    globals: {},
    error: null,
    loading: Boolean(initialLoader),
  });

  // 갱신된 setup은 새 loader로 다시 불러오고, 그동안은 이전 wrapper를 유지
  useEffect(() => {
    if (!updates) return;
    const listener = (event: Event) => {
      const next = (event as CustomEvent<PreviewSetupLoader>).detail;
      setLoadSetup(() => next);
    };
    updates.addEventListener(PREVIEW_SETUP_UPDATED_EVENT, listener);
    return () => updates.removeEventListener(PREVIEW_SETUP_UPDATED_EVENT, listener);
  }, [updates]);

  useEffect(() => {
    if (!loadSetup) return;

    let cancelled = false;
    loadSetup()
      .then((module) => {
        if (cancelled) return;
        if (!isPreviewComponent(module.default)) {
          throw new Error("Vitrine setupFile must default export a React wrapper component");
        }
        const globals = parseGlobals(module.globals);
        setState({ wrapper: module.default as PreviewWrapper, globals, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          wrapper: undefined,
          globals: {},
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
