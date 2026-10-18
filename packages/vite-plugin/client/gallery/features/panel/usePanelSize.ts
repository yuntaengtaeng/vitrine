import { useState } from "react";
import { readStored, writeStored } from "../../shared/browserStorage";
import { parsePanelSize, type PanelSize } from "./panelSize";

const STORAGE_KEY = "vitrine:panel";

/** 프리뷰를 바꾸거나 Gallery를 reload해도 같은 크기로 열리도록 브라우저 저장소에 보관 */
export const usePanelSize = (): [PanelSize, (patch: Partial<PanelSize>) => void] => {
  const [size, setSize] = useState(() => parsePanelSize(readStored(STORAGE_KEY)));
  const update = (patch: Partial<PanelSize>) => {
    setSize((current) => {
      const next = { ...current, ...patch };
      writeStored(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };
  return [size, update];
};
