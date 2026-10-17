import { useState } from "react";
import { parseStageSettings, type StageSettings } from "../preview/stageSettings";

const STORAGE_KEY = "vitrine:stage";

// 비공개 창이나 막힌 저장소에서는 접근 자체가 throw할 수 있어 저장 없이 동작
const readStored = (): string | null => {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

const writeStored = (settings: StageSettings) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // 저장 실패는 이번 세션 설정에 영향 없음
  }
};

/** 무대 배경과 너비 설정, Gallery reload 뒤에도 유지되도록 브라우저 저장소에 보관 */
export const useStageSettings = (): [StageSettings, (patch: Partial<StageSettings>) => void] => {
  const [settings, setSettings] = useState(() => parseStageSettings(readStored()));
  const update = (patch: Partial<StageSettings>) => {
    setSettings((current) => {
      const next = { ...current, ...patch };
      writeStored(next);
      return next;
    });
  };
  return [settings, update];
};
