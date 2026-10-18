import { describe, expect, it } from "vitest";
import { resolveTheme } from "./colorTheme";

const synced = { supported: { "theme.sync": 1 }, outdated: null };
const unsynced = { supported: {}, outdated: null };

describe("resolveTheme", () => {
  it("theme.sync를 맞췄으면 VS Code 테마를 따름", () => {
    expect(resolveTheme({ host: synced, hostTheme: "dark", systemDark: false })).toBe("dark");
    expect(resolveTheme({ host: synced, hostTheme: "light", systemDark: true })).toBe("light");
  });

  it("맞추지 않았거나 아직 테마를 받지 못했으면 시스템 설정", () => {
    expect(resolveTheme({ host: unsynced, hostTheme: "dark", systemDark: false })).toBe("light");
    expect(resolveTheme({ host: null, hostTheme: null, systemDark: true })).toBe("dark");
    expect(resolveTheme({ host: synced, hostTheme: null, systemDark: true })).toBe("dark");
  });
});
