import { useEffect, useReducer, useRef } from "react";
import { createGalleryFrameLink, type FrameRenderState, type GalleryFrameLink } from "./frameLink";
import { INITIAL_FRAME_STATUS, reduceFrameStatus } from "./frameStatus";

/**
 * 프리뷰 iframe과의 연결, 받은 메시지로 frame 상태를 갱신하고 그릴 상태를 frame 준비에 맞춰 전송
 * renderState가 null이면 아직 보낼 상태가 없음 (첫 frameReady로 초기 variant를 알기 전)
 */
export const usePreviewFrame = (renderState: FrameRenderState | null) => {
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

  useEffect(() => {
    if (renderState) linkRef.current?.render(renderState);
  }, [renderState]);

  return { iframeRef, status };
};
