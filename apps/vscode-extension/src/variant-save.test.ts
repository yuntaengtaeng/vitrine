import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import { variantEditConflict } from "./variant-save.js";

const hashOf = (text: string) => crypto.createHash("sha256").update(text).digest("hex");

describe("variantEditConflict", () => {
  it("plugin이 읽은 내용과 버퍼가 같으면 적용 가능", () => {
    expect(variantEditConflict("const a = 1;", false, hashOf("const a = 1;"))).toBeNull();
  });

  it("다르면 저장 안 한 수정인지, 파일이 바뀐 것인지 구분해 안내", () => {
    expect(variantEditConflict("const a = 2;", true, hashOf("const a = 1;"))).toContain("unsaved changes");
    expect(variantEditConflict("const a = 2;", false, hashOf("const a = 1;"))).toContain("changed after the gallery read it");
  });
});
