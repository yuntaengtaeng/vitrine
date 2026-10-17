import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmptyGallery } from "./EmptyGallery";

describe("EmptyGallery", () => {
  it("실제로 스캔하는 include 패턴과 추가 예시를 보여줌", () => {
    const markup = renderToStaticMarkup(createElement(EmptyGallery, { include: ["app/**/*.tsx"] }));
    expect(markup).toContain("<code");
    expect(markup).toContain("app/**/*.tsx</code>");
    expect(markup).toContain("vitrine({ include: [&quot;app/**/*.tsx&quot;, &quot;packages/ui/**/*.tsx&quot;] })");
  });
});
