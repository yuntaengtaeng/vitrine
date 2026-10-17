import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VariantPicker } from "./VariantPicker";

describe("VariantPicker", () => {
  it("선택된 variant만 aria-pressed true로 표시", () => {
    const markup = renderToStaticMarkup(
      createElement(VariantPicker, {
        variants: [
          { key: "primary", name: "Primary" },
          { key: "danger", name: "Danger" },
        ],
        activeKey: "danger",
        onSelect: () => {},
      }),
    );
    expect(markup).toMatch(/aria-pressed="false"[^>]*>Primary</);
    expect(markup).toMatch(/aria-pressed="true"[^>]*>Danger</);
  });
});
