import { isGalleryToFrameMessage, type FrameRenderMessage, type FrameToGalleryMessage } from "@vitrine/protocol";

/** Gallery 안 iframe으로 열렸는지 판단, frame 페이지를 단독으로 열면 보낼 대상이 없음 */
const hasGallery = () => window.parent !== window;

/** Gallery에 frame 메시지 전송, 같은 origin의 Gallery만 받음 */
export function sendToGallery(message: FrameToGalleryMessage): void {
  if (hasGallery()) window.parent.postMessage(message, window.location.origin);
}

/** Gallery가 보낸 render 메시지만 골라 전달하는 구독, 해제 함수 반환 */
export function subscribeToGallery(onRender: (message: FrameRenderMessage) => void): () => void {
  const handleMessage = (event: MessageEvent) => {
    if (event.source !== window.parent || event.origin !== window.location.origin) return;
    if (isGalleryToFrameMessage(event.data)) onRender(event.data);
  };
  window.addEventListener("message", handleMessage);
  return () => window.removeEventListener("message", handleMessage);
}
