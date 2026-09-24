import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { isManifest } from "@vitrine/protocol";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scanPreviews, scanSource } from "./scan.js";

const scan = (code: string) => scanSource(code, "Button.tsx");

describe("props controls", () => {
  let root: string;

  beforeEach(() => {
    root = fs.mkdtempSync(path.join(os.tmpdir(), "vitrine-props-test-"));
    fs.mkdirSync(path.join(root, "src"));
    fs.writeFileSync(
      path.join(root, "tsconfig.json"),
      JSON.stringify({ compilerOptions: { jsx: "react-jsx", strict: true }, include: ["src"] }),
    );
  });

  afterEach(() => {
    fs.rmSync(root, { recursive: true, force: true });
  });

  it("infers controls through an imported props type", async () => {
    fs.writeFileSync(
      path.join(root, "src", "Button.types.ts"),
      [
        "export interface ButtonProps {",
        "  variant: 'primary' | 'danger';",
        "  disabled?: boolean;",
        "  label: string;",
        "  count: number;",
        "  data: { id: string };",
        "}",
      ].join("\n"),
    );
    fs.writeFileSync(
      path.join(root, "src", "Button.tsx"),
      [
        "import type { ButtonProps } from './Button.types';",
        "/** @preview */",
        "export const Button = (props: ButtonProps) => <button>{props.label}</button>;",
      ].join("\n"),
    );

    const [entry] = await scanPreviews({ root });

    expect(entry.controls).toEqual({
      variant: { type: "select", options: ["primary", "danger"], optional: false, defaultValue: "primary" },
      disabled: { type: "boolean", optional: true },
      label: { type: "text", optional: false, defaultValue: "" },
      count: { type: "number", optional: false, defaultValue: 0 },
    });
    expect(isManifest([entry])).toBe(true);
  });
});

describe("scan line ranges", () => {
  it("gives a single-line export a startLine equal to endLine", () => {
    const entries = scan(
      [
        "export function Button() { return null; }",
        "",
        "/** @preview */",
        "export const PrimaryButton = () => Button();",
      ].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].startLine).toBe(entries[0].endLine);
    expect(entries[0].startLine).toBe(4);
  });

  it("spans the full declaration for a multi-line export", () => {
    const entries = scan(
      [
        "export function Button() { return null; }",
        "",
        "/** @preview */",
        "export const WrappedButton = () => {",
        "  return Button();",
        "};",
      ].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].startLine).toBe(4);
    expect(entries[0].endLine).toBe(6);
  });

  it("gives independent ranges to multiple previews in one file", () => {
    const entries = scan(
      [
        "export function Button() { return null; }",
        "",
        "/** @preview */",
        "export const First = () => Button();",
        "",
        "/** @preview */",
        "export const Second = () => Button();",
      ].join("\n"),
    );

    expect(entries).toHaveLength(2);
    expect(entries.find((e) => e.exportName === "First")?.startLine).toBe(4);
    expect(entries.find((e) => e.exportName === "Second")?.startLine).toBe(7);
  });

  it("spans from the declaration to export default of that identifier", () => {
    const entries = scan(
      [
        "/** @preview */",
        "const Chip = () => (",
        "  <span>Chip</span>",
        ");",
        "",
        "export default Chip;",
      ].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].startLine).toBe(2);
    expect(entries[0].endLine).toBe(6);
  });

  it("includes a hoisted function declared after export default", () => {
    const entries = scan(
      [
        "/** @preview */",
        "export default Chip;",
        "",
        "function Chip() {",
        "  return null;",
        "}",
      ].join("\n"),
    );

    expect(entries[0].startLine).toBe(2);
    expect(entries[0].endLine).toBe(6);
  });
});

describe("named export comment fallback scope", () => {
  it("does not skip an unrelated statement to reach export const", () => {
    const entries = scan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "export const Exported = () => null;",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });

  it("does not skip an unrelated statement to reach export function", () => {
    const entries = scan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "export function Exported() { return null; }",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });

  it("does not skip an unrelated statement to reach export default function", () => {
    const entries = scan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "export default function Exported() { return null; }",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });
});

describe("scan export default", () => {
  it("uses the named function's own name as the label", () => {
    const entries = scan(
      ["/** @preview */", "export default function PrimaryButton() { return null; }"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].exportName).toBe("default");
    expect(entries[0].name).toBe("PrimaryButton");
    expect(entries[0].id).toBe("Button.tsx#default");
  });

  it("falls back to the file name for an anonymous default export", () => {
    const entries = scan(
      ["/** @preview */", "export default () => null;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].exportName).toBe("default");
    expect(entries[0].name).toBe("Button");
  });

  it("uses the referenced identifier's name for export default of a variable", () => {
    const entries = scan(
      ["const Wrapped = () => null;", "", "/** @preview */", "export default Wrapped;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Wrapped");
  });

  it("still honors an explicit name= option over any fallback", () => {
    const entries = scan(
      ['/** @preview name="Main button" */', "export default () => null;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Main button");
  });

  it("also accepts single-quoted name= values", () => {
    const entries = scan(
      ["/** @preview name='Main button' */", "export default () => null;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Main button");
  });

  it("ignores an unquoted name= value and falls back instead", () => {
    const entries = scan(
      ["/** @preview name=Main button */", "export default function MainButton() { return null; }"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("MainButton");
  });

  it("ignores a default export with no @preview comment", () => {
    const entries = scan(["export default () => null;"].join("\n"));

    expect(entries).toHaveLength(0);
  });

  it("matches a comment above the const declared right before the export", () => {
    const entries = scan(
      ["/** @preview */", "const Chip = () => null;", "", "export default Chip;"].join("\n"),
    );

    expect(entries).toHaveLength(1);
    expect(entries[0].name).toBe("Chip");
  });

  it("does not reach past an unrelated statement to grab an earlier comment", () => {
    const entries = scan(
      [
        "/** @preview */",
        "const Unrelated = () => null;",
        "",
        "const Exported = () => null;",
        "",
        "export default Exported;",
      ].join("\n"),
    );

    expect(entries).toHaveLength(0);
  });
});

describe("name= group extraction", () => {
  it("splits a single / into group and name", () => {
    const entries = scan(
      ['/** @preview name="Inputs/Danger button" */', "export default () => null;"].join("\n"),
    );

    expect(entries[0].group).toBe("Inputs");
    expect(entries[0].name).toBe("Danger button");
  });

  it("treats multiple / as a nested group path", () => {
    const entries = scan(
      ['/** @preview name="Inputs/Forms/Danger button" */', "export default () => null;"].join("\n"),
    );

    expect(entries[0].group).toBe("Inputs/Forms");
    expect(entries[0].name).toBe("Danger button");
  });

  it("trims whitespace around each segment", () => {
    const entries = scan(
      ['/** @preview name=" Inputs / Danger button " */', "export default () => null;"].join("\n"),
    );

    expect(entries[0].group).toBe("Inputs");
    expect(entries[0].name).toBe("Danger button");
  });

  it("drops empty segments from doubled or trailing /", () => {
    const entries = scan(
      ['/** @preview name="Inputs//Danger button" */', "export default () => null;"].join("\n"),
    );

    expect(entries[0].group).toBe("Inputs");
    expect(entries[0].name).toBe("Danger button");
  });

  it("leaves group undefined when a trailing / has no name segment after it", () => {
    const entries = scan(
      ['/** @preview name="Inputs/" */', "export default () => null;"].join("\n"),
    );

    expect(entries[0].group).toBeUndefined();
    expect(entries[0].name).toBe("Inputs");
  });

  it("leaves group undefined when name has no /", () => {
    const entries = scan(
      ['/** @preview name="Danger button" */', "export default () => null;"].join("\n"),
    );

    expect(entries[0].group).toBeUndefined();
    expect(entries[0].name).toBe("Danger button");
  });

  it("leaves group undefined for a fallback name with no explicit name=", () => {
    const entries = scan(
      ["/** @preview */", "export default function PrimaryButton() { return null; }"].join("\n"),
    );

    expect(entries[0].group).toBeUndefined();
    expect(entries[0].name).toBe("PrimaryButton");
  });
});
