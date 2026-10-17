import { useState } from "react";
import { readStored, writeStored } from "../../shared/browserStorage";
import { parseStageSettings, type StageSettings } from "./stageSettings";

const STORAGE_KEY = "vitrine:stage";

/** 무대 배경과 너비 설정, Gallery reload 뒤에도 유지되도록 브라우저 저장소에 보관 */
export const useStageSettings = (): [StageSettings, (patch: Partial<StageSettings>) => void] => {
  const [settings, setSettings] = useState(() => parseStageSettings(readStored(STORAGE_KEY)));
  const update = (patch: Partial<StageSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeStored(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };
  return [settings, update];
};
