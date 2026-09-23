import { describe, expect, it } from "vitest";
import { renderIframeHtml, renderNotFoundHtml, renderUnreachableHtml } from "./webview-html.js";

describe("renderIframeHtml", () => {
  const galleryUrl = "http://localhost:5173/__vitrine";

  it("allows only the gallery origin as a frame source", () => {
    const html = renderIframeHtml(galleryUrl, "app");
    expect(html).toContain("frame-src http://localhost:5173;");
    expect(html).toContain(`<iframe src="${galleryUrl}"></iframe>`);
  });

  it("relays cursor messages only to the gallery origin", () => {
    expect(renderIframeHtml(galleryUrl, "app")).toContain('const galleryOrigin = "http://localhost:5173";');
  });

  it("uses a fresh script nonce for each render", () => {
    const nonceOf = (html: string) => html.match(/'nonce-([0-9a-f]+)'/)?.[1];
    expect(nonceOf(renderIframeHtml(galleryUrl, "app"))).not.toBe(nonceOf(renderIframeHtml(galleryUrl, "app")));
  });
});

describe("fallback pages", () => {
  it("do not allow any frame source or relay target", () => {
    for (const html of [renderNotFoundHtml(), renderUnreachableHtml("http://localhost:5173/__vitrine")]) {
      expect(html).not.toContain("frame-src");
      expect(html).toContain("const galleryOrigin = null;");
    }
  });
});
