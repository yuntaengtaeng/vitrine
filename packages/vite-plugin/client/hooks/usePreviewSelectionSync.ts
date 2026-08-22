import {
  PREVIEW_SELECTED_MESSAGE_TYPE,
  isExtensionToGalleryMessage,
  type GalleryToExtensionMessage,
} from "@vitrine/protocol";
import { useEffect, useState } from "react";

/** 선택된 프리뷰 id를 웹뷰 래퍼와 postMessage로 양방향 동기화 */
export const usePreviewSelectionSync = (entries: GalleryPreviewEntry[]): [string | null, (id: string) => void] => {
  const [activeId, setActiveId] = useState<string | null>(entries[0]?.id ?? null);

  // 수동 클릭과 커서 동기화로 인한 프로그램적 선택 모두 여기로 모임, 부모(webview 래퍼)에
  // 알려서 익스텐션의 커서 추적 상태가 실제 표시 중인 프리뷰와 어긋나지 않게 함
  useEffect(() => {
    if (!activeId) return;
    const message: GalleryToExtensionMessage = {
      type: PREVIEW_SELECTED_MESSAGE_TYPE,
      id: activeId,
    };
    window.parent.postMessage(message, "*");
  }, [activeId]);

  // 부모(webview 래퍼)가 에디터 커서 위치에 맞는 프리뷰 id를 postMessage로 전달하면 선택과 동일하게 처리
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.source !== window.parent) return;
      const data: unknown = event.data;
      if (!isExtensionToGalleryMessage(data)) return;
      if (entries.some((entry) => entry.id === data.id)) setActiveId(data.id);
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [entries]);

  return [activeId, setActiveId];
};
