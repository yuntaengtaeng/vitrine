import {
  CAPABILITIES_PROTOCOL,
  CAPABILITIES_RESPONSE_MESSAGE_TYPE,
  type Capabilities,
  type CapabilitiesResponseMessage,
} from "@vitrine/protocol";

/** 이 확장이 Gallery와 함께 할 수 있는 기능과 버전 (ADR 006) */
export const EXTENSION_CAPABILITIES: Capabilities = {};

export function capabilitiesResponse(capabilities: Capabilities = EXTENSION_CAPABILITIES): CapabilitiesResponseMessage {
  return { type: CAPABILITIES_RESPONSE_MESSAGE_TYPE, protocol: CAPABILITIES_PROTOCOL, capabilities };
}
