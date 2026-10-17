import { useState } from "react";
import { readStored, writeStored } from "./shared/browserStorage";

const STORAGE_KEY = "vitrine:panel-tab";

/** 고른 패널 탭, 프리뷰를 바꾸거나 reload해도 유지 */
export const usePanelTab = (fallback: string): [string, (id: string) => void] => {
  const [tab, setTab] = useState(() => readStored(STORAGE_KEY) ?? fallback);
  const select = (id: string) => {
    setTab(id);
    writeStored(STORAGE_KEY, id);
  };
  return [tab, select];
};
