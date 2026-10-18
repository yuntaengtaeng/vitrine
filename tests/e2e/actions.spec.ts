import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

test("action prop 호출이 Actions 탭에 기록되고 Clear로 비움", async ({ page }) => {
  await openPreview(page, "Toast");
  const frame = await previewFrame(page);
  await page.getByRole("tab", { name: "Actions" }).click();
  const panel = page.getByRole("tabpanel", { name: "Actions" });
  await expect(panel.getByText("Use the preview to record calls to onUndo")).toBeVisible();

  await frame.getByRole("button", { name: "Undo" }).click();

  const calls = panel.getByRole("list", { name: "Action calls" }).getByRole("listitem");
  await expect(calls).toHaveCount(1);
  await expect(calls.first()).toContainText("onUndo");
  await expect(calls.first()).toContainText("[event click]");

  await page.getByRole("button", { name: "Clear" }).click();
  await expect(calls).toHaveCount(0);
});

test("action prop이 없는 프리뷰에는 Actions 탭이 없음", async ({ page }) => {
  await openPreview(page, "Badge");
  await previewFrame(page);
  await expect(page.getByRole("tab", { name: "Props" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Actions" })).toHaveCount(0);
});
