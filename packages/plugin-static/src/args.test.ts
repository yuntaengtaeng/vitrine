import { describe, expect, it } from "vitest";
import { parseArgs } from "./args";

describe("parseArgs", () => {
  it("build와 root, config 경로 해석", () => {
    expect(parseArgs(["build"])).toEqual({ ok: true, root: undefined, configFile: undefined });
    expect(parseArgs(["build", "apps/web", "--config", "vite.gallery.ts"])).toEqual({
      ok: true,
      root: "apps/web",
      configFile: "vite.gallery.ts",
    });
  });

  it("명령이 없거나 --help면 도움말", () => {
    expect(parseArgs([])).toEqual({ ok: false });
    expect(parseArgs(["build", "--help"])).toEqual({ ok: false });
  });

  it("모르는 명령과 옵션, 값 없는 --config는 이유와 함께 거절", () => {
    expect(parseArgs(["serve"])).toEqual({ ok: false, message: "Unknown command: serve" });
    expect(parseArgs(["build", "--watch"])).toEqual({ ok: false, message: "Unknown option: --watch" });
    expect(parseArgs(["build", "--config"])).toEqual({ ok: false, message: "--config needs a file path" });
    expect(parseArgs(["build", "a", "b"])).toEqual({ ok: false, message: "Unexpected argument: b" });
  });
});
