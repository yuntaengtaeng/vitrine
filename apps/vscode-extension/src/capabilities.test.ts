import { isExtensionToGalleryMessage } from "@vitrine/protocol";
import { describe, expect, it } from "vitest";
import { capabilitiesResponse, themeChanged } from "./capabilities.js";

describe("capabilitiesResponse", () => {
  it("Gallery가 받아들이는 handshake 응답", () => {
    expect(isExtensionToGalleryMessage(capabilitiesResponse({ "theme.sync": 1 }))).toBe(true);
  });

  it("테마 알림도 Gallery가 받아들이는 형식", () => {
    expect(isExtensionToGalleryMessage(themeChanged(true))).toBe(true);
    expect(themeChanged(false).kind).toBe("light");
  });
});
