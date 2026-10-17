import { isRecord } from "./guards.js";

/** handshake 메시지 형식이나 handshake 자체가 깨질 때만 올리는 정수 (ADR 006) */
export const CAPABILITIES_PROTOCOL = 1;

export const CAPABILITIES_REQUEST_MESSAGE_TYPE = "capabilitiesRequest";
export const CAPABILITIES_RESPONSE_MESSAGE_TYPE = "capabilitiesResponse";

/** `영역.동작` 이름별 기능 버전 */
export type Capabilities = Record<string, number>;

/** Gallery -> Extension: Gallery가 할 수 있는 기능 */
export interface CapabilitiesRequestMessage {
  type: typeof CAPABILITIES_REQUEST_MESSAGE_TYPE;
  protocol: number;
  capabilities: Capabilities;
}

/** Extension -> Gallery: Extension이 할 수 있는 기능 */
export interface CapabilitiesResponseMessage {
  type: typeof CAPABILITIES_RESPONSE_MESSAGE_TYPE;
  protocol: number;
  capabilities: Capabilities;
}

export interface NegotiatedCapabilities {
  /** 양쪽이 모두 지원하는 기능과 둘 중 낮은 버전 */
  supported: Capabilities;
  /**
   * handshake protocol이 다를 때 먼저 업데이트해야 하는 쪽
   * 응답이 없으면(브라우저 단독, 옛 확장) null이고 확장 기능만 숨김
   */
  outdated: "extension" | "plugin" | null;
}

export function isCapabilities(value: unknown): value is Capabilities {
  return isRecord(value) && Object.values(value).every((version) => Number.isSafeInteger(version) && (version as number) > 0);
}

export function isCapabilitiesRequestMessage(value: unknown): value is CapabilitiesRequestMessage {
  return (
    isRecord(value) &&
    value.type === CAPABILITIES_REQUEST_MESSAGE_TYPE &&
    Number.isSafeInteger(value.protocol) &&
    isCapabilities(value.capabilities)
  );
}

export function isCapabilitiesResponseMessage(value: unknown): value is CapabilitiesResponseMessage {
  return (
    isRecord(value) &&
    value.type === CAPABILITIES_RESPONSE_MESSAGE_TYPE &&
    Number.isSafeInteger(value.protocol) &&
    isCapabilities(value.capabilities)
  );
}

/**
 * Gallery 기능과 확장 응답으로 실제로 켤 기능 계산, 모르는 기능은 무시
 * @param gallery Gallery가 할 수 있는 기능
 * @param response 확장 응답, 정해진 시간 안에 오지 않았으면 null
 */
export function negotiateCapabilities(
  gallery: Capabilities,
  response: CapabilitiesResponseMessage | null,
): NegotiatedCapabilities {
  if (!response) return { supported: {}, outdated: null };
  if (response.protocol !== CAPABILITIES_PROTOCOL) {
    return { supported: {}, outdated: response.protocol < CAPABILITIES_PROTOCOL ? "extension" : "plugin" };
  }
  const supported = Object.fromEntries(
    Object.entries(gallery)
      .filter(([name]) => name in response.capabilities)
      .map(([name, version]) => [name, Math.min(version, response.capabilities[name])]),
  );
  return { supported, outdated: null };
}
