import { describe, expect, it } from "vitest";
import {
  CAPABILITIES_PROTOCOL,
  isCapabilitiesRequestMessage,
  isCapabilitiesResponseMessage,
  negotiateCapabilities,
} from "./capabilities";

const response = (capabilities: Record<string, number>, protocol = CAPABILITIES_PROTOCOL) => ({
  type: "capabilitiesResponse" as const,
  protocol,
  capabilities,
});

describe("negotiateCapabilities", () => {
  it("양쪽이 모두 아는 기능만 낮은 버전으로", () => {
    expect(negotiateCapabilities({ "theme.sync": 2, "variant.save": 1 }, response({ "theme.sync": 1, "plugin.x.y": 3 }))).toEqual({
      supported: { "theme.sync": 1 },
      outdated: null,
    });
  });

  it("응답이 없으면 확장 기능을 모두 끄고 안내도 하지 않음", () => {
    expect(negotiateCapabilities({ "theme.sync": 1 }, null)).toEqual({ supported: {}, outdated: null });
  });

  it("protocol이 다르면 기능을 끄고 낮은 쪽을 업데이트 대상으로", () => {
    expect(negotiateCapabilities({ "theme.sync": 1 }, response({ "theme.sync": 1 }, CAPABILITIES_PROTOCOL - 1)).outdated).toBe(
      "extension",
    );
    expect(negotiateCapabilities({ "theme.sync": 1 }, response({ "theme.sync": 1 }, CAPABILITIES_PROTOCOL + 1))).toEqual({
      supported: {},
      outdated: "plugin",
    });
  });
});

describe("capabilities message validators", () => {
  it("기능 버전은 양의 정수만", () => {
    expect(isCapabilitiesResponseMessage(response({ "theme.sync": 1 }))).toBe(true);
    expect(isCapabilitiesResponseMessage(response({ "theme.sync": 0 }))).toBe(false);
    expect(isCapabilitiesResponseMessage(response({ "theme.sync": 1.5 }))).toBe(false);
    expect(isCapabilitiesRequestMessage({ type: "capabilitiesRequest", protocol: 1, capabilities: {} })).toBe(true);
    expect(isCapabilitiesRequestMessage({ type: "capabilitiesRequest", capabilities: {} })).toBe(false);
  });
});
