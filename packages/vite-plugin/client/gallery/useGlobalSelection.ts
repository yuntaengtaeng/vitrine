import type { FrameGlobalValues } from "@vitrine/protocol";
import { useState } from "react";
import { readStored, writeStored } from "./shared/browserStorage";

const STORAGE_KEY = "vitrine:globals";

/** 저장된 값 중 문자열 값만 남김 */
export function parseGlobalSelection(raw: string | null): FrameGlobalValues {
  if (!raw) return {};
  try {
    const value: unknown = JSON.parse(raw);
    if (typeof value !== "object" || value === null || Array.isArray(value)) return {};
    return Object.fromEntries(Object.entries(value).filter(([, item]) => typeof item === "string")) as FrameGlobalValues;
  } catch {
    return {};
  }
}

/** toolbar에서 고른 globals, 프리뷰를 바꾸거나 reload해도 유지 */
export const useGlobalSelection = (): [FrameGlobalValues, (name: string, value: string) => void] => {
  const [chosen, setChosen] = useState(() => parseGlobalSelection(readStored(STORAGE_KEY)));
  const choose = (name: string, value: string) =>
    setChosen((current) => {
      const next = { ...current, [name]: value };
      writeStored(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  return [chosen, choose];
};
