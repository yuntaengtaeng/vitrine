import fs from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

// 파일 내용만 바꿔 프리뷰 목록은 그대로 두므로 다른 테스트의 Gallery가 reload되지 않음
const file = path.resolve("examples/react-basic/src/HistoryDemo.tsx");
const write = (label: string) =>
  fs.writeFileSync(file, `/** @preview */\nexport const HistoryDemo = () => <p style={{ margin: 0 }}>${label}</p>;\n`);

test.describe.configure({ mode: "serial" });
test.afterEach(() => write("Version A"));

test("저장한 옛 버전을 지금 버전 옆에 나란히, 겹쳐서 비교", async ({ page }) => {
  await openPreview(page, "HistoryDemo");
  await expect((await previewFrame(page)).getByText("Version A")).toBeVisible();

  write("Version B");
  const frame = await previewFrame(page);
  await expect(frame.getByText("Version B")).toBeVisible();

  await page.getByRole("group", { name: "View" }).getByRole("button", { name: "History" }).click();
  await expect(frame.locator("[data-grid-cell]")).toHaveCount(2);
  await expect(frame.locator("[data-grid-cell]").first()).toContainText("Version A");
  await expect(frame.getByRole("region", { name: "Current" })).toContainText("Version B");
  await expect(page.getByRole("group", { name: "History" }).getByLabel("Compare")).toContainText(/Snapshot \d+, \d\d:\d\d:\d\d/);

  await page.getByRole("group", { name: "History" }).getByLabel("Mode").selectOption("overlay");
  await expect(frame.getByText(/Current, 50% over/)).toBeVisible();
});
