import {
  CAPABILITIES_PROTOCOL,
  CAPABILITIES_REQUEST_MESSAGE_TYPE,
  THEME_SYNC_CAPABILITY,
  VARIANT_SAVE_CAPABILITY,
  isCapabilitiesResponseMessage,
  negotiateCapabilities,
  type Capabilities,
  type CapabilitiesRequestMessage,
  type NegotiatedCapabilities,
} from "@vitrine/protocol";
import { useEffect, useState } from "react";

/** Gallery가 확장과 함께 할 수 있는 기능과 버전 (ADR 006) */
export const GALLERY_CAPABILITIES: Capabilities = { [THEME_SYNC_CAPABILITY]: 1, [VARIANT_SAVE_CAPABILITY]: 1 };

// 옛 확장의 relay는 모르는 type을 넘기지 않아 응답이 오지 않으므로 기다림을 끊음
const RESPONSE_TIMEOUT_MS = 1500;

const NO_HOST: NegotiatedCapabilities = { supported: {}, outdated: null };

/** 확장과 맞춘 기능, 응답을 기다리는 동안 null */
export const useHostCapabilities = (embedded: boolean): NegotiatedCapabilities | null => {
  const [negotiated, setNegotiated] = useState<NegotiatedCapabilities | null>(embedded ? null : NO_HOST);

  useEffect(() => {
    if (!embedded) return;
    const finish = (response: Parameters<typeof negotiateCapabilities>[1]) => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
      setNegotiated(negotiateCapabilities(GALLERY_CAPABILITIES, response));
    };
    const handleMessage = (event: MessageEvent) => {
      if (event.source === window.parent && isCapabilitiesResponseMessage(event.data)) finish(event.data);
    };
    const timer = setTimeout(() => finish(null), RESPONSE_TIMEOUT_MS);
    window.addEventListener("message", handleMessage);
    const request: CapabilitiesRequestMessage = {
      type: CAPABILITIES_REQUEST_MESSAGE_TYPE,
      protocol: CAPABILITIES_PROTOCOL,
      capabilities: GALLERY_CAPABILITIES,
    };
    window.parent.postMessage(request, "*");
    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timer);
    };
  }, [embedded]);

  return negotiated;
};
