import type { FrameGlobalValues } from "@vitrine/protocol";
import { useEffect, useReducer, useRef } from "react";
import { createGalleryFrameLink, type FrameSelection, type GalleryFrameLink, type LayoutFor } from "./frameLink";
import { CLEAR_ACTIONS, INITIAL_FRAME_STATUS, reduceFrameStatus } from "./frameStatus";

/**
 * 프리뷰 iframe과의 연결, 받은 메시지로 frame 상태를 갱신하고 그릴 상태를 frame 준비에 맞춰 전송
 * selection이 null이면 아직 보낼 상태가 없음 (첫 frameReady로 초기 variant를 알기 전)
 */
export const usePreviewFrame = (selection: FrameSelection | null, layoutFor: LayoutFor, globals: FrameGlobalValues) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const linkRef = useRef<GalleryFrameLink | null>(null);
  const [status, dispatch] = useReducer(reduceFrameStatus, INITIAL_FRAME_STATUS);

  // 연결은 iframe이 붙은 뒤 effect에서 만들고, 아래 render effect보다 먼저 실행됨
  useEffect(() => {
    const link = createGalleryFrameLink((message) =>
      iframeRef.current?.contentWindow?.postMessage(message, window.location.origin),
    );
    linkRef.current = link;
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow || event.origin !== window.location.origin) return;
      const message = link.receive(event.data);
      if (message) dispatch(message);
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
      linkRef.current = null;
    };
  }, []);

  // 보기는 frame이 알려준 variant와 control 목록으로 배치를 만들므로 ready가 바뀌면 다시 보냄
  const { ready } = status;
  useEffect(() => {
    if (!selection) return;
    const layout = layoutFor({
      variants: ready?.variants ?? [],
      controls: ready?.controls ?? {},
      variantKey: selection.variantKey,
      overrides: selection.args,
    });
    linkRef.current?.render({ ...selection, layout, globals });
  }, [selection, ready, layoutFor, globals]);

  return { iframeRef, status, clearActions: () => dispatch(CLEAR_ACTIONS) };
};
