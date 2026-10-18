import {
  CAPABILITIES_PROTOCOL,
  CAPABILITIES_RESPONSE_MESSAGE_TYPE,
  THEME_CHANGED_MESSAGE_TYPE,
  THEME_SYNC_CAPABILITY,
  VARIANT_SAVE_CAPABILITY,
  type Capabilities,
  type CapabilitiesResponseMessage,
  type ThemeChangedMessage,
} from "@vitrine/protocol";

/** 이 확장이 Gallery와 함께 할 수 있는 기능과 버전 (ADR 006) */
export const EXTENSION_CAPABILITIES: Capabilities = { [THEME_SYNC_CAPABILITY]: 1, [VARIANT_SAVE_CAPABILITY]: 1 };

export function capabilitiesResponse(capabilities: Capabilities = EXTENSION_CAPABILITIES): CapabilitiesResponseMessage {
  return { type: CAPABILITIES_RESPONSE_MESSAGE_TYPE, protocol: CAPABILITIES_PROTOCOL, capabilities };
}

export function themeChanged(isDark: boolean): ThemeChangedMessage {
  return { type: THEME_CHANGED_MESSAGE_TYPE, kind: isDark ? "dark" : "light" };
}
