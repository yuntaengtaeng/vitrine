import { isExtensionToGalleryMessage } from "@vitrine/protocol";
import { describe, expect, it } from "vitest";
import { capabilitiesResponse } from "./capabilities.js";

describe("capabilitiesResponse", () => {
  it("Gallery가 받아들이는 handshake 응답", () => {
    expect(isExtensionToGalleryMessage(capabilitiesResponse({ "theme.sync": 1 }))).toBe(true);
  });
});
