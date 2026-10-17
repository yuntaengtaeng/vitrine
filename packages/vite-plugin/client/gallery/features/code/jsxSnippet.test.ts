import { describe, expect, it } from "vitest";
import { jsxSnippet } from "./jsxSnippet";

describe("jsxSnippet", () => {
  it("짧으면 한 줄, true는 이름만, false와 숫자는 표현식", () => {
    expect(jsxSnippet("Button", { variant: "danger", disabled: true, block: false, count: 2 })).toBe(
      '<Button variant="danger" disabled block={false} count={2} />',
    );
  });

  it("값이 없는 prop은 빼고 props가 없으면 빈 태그", () => {
    expect(jsxSnippet("Badge", { tone: undefined })).toBe("<Badge />");
  });

  it("따옴표나 줄바꿈이 있는 문자열은 표현식으로 감쌈", () => {
    expect(jsxSnippet("Note", { title: 'Say "hi"' })).toBe('<Note title={"Say \\"hi\\""} />');
  });

  it("문자열 children은 태그 사이에 둠", () => {
    expect(jsxSnippet("Button", { variant: "primary", children: "Save" })).toBe('<Button variant="primary">Save</Button>');
  });

  it("길면 prop마다 한 줄", () => {
    expect(
      jsxSnippet("Card", { title: "A fairly long card title", description: "Shown under the title", tone: "info" }),
    ).toBe('<Card\n  title="A fairly long card title"\n  description="Shown under the title"\n  tone="info"\n/>');
  });
});
