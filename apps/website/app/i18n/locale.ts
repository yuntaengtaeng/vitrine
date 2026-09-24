import { useLocation } from "react-router";
import { en, type Messages } from "./en";
import { ko } from "./ko";

export type Locale = "en" | "ko";

const MESSAGES: Record<Locale, Messages> = { en, ko };

/** 경로의 첫 세그먼트로 언어 판단, /ko로 시작하지 않으면 영어 */
export function localeFromPath(pathname: string): Locale {
  return pathname === "/ko" || pathname.startsWith("/ko/") ? "ko" : "en";
}

/** 언어별 홈 경로 */
export function homePath(locale: Locale): string {
  return locale === "ko" ? "/ko" : "/";
}

/** 언어별 문서 경로 */
export function docsPath(locale: Locale): string {
  return locale === "ko" ? "/ko/docs" : "/docs";
}

export function messagesFor(locale: Locale): Messages {
  return MESSAGES[locale];
}

/** 현재 경로의 언어와 문구 조회 */
export function useI18n() {
  const locale = localeFromPath(useLocation().pathname);
  return { locale, t: MESSAGES[locale] };
}
