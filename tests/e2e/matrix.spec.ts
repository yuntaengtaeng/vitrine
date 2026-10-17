import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

test("Matrix 보기는 축 prop 조합마다 칸을 그리고 열을 None으로 줄일 수 있음", async ({ page }) => {
  await openPreview(page, "Automatic controls");
  const frame = await previewFrame(page);

  await page.getByRole("group", { name: "View" }).getByRole("button", { name: "Matrix" }).click();
  const axes = page.getByRole("group", { name: "Matrix axes" });
  await expect(axes.getByLabel("Rows")).toHaveValue("enabled");
  await expect(axes.getByLabel("Columns")).toHaveValue("size");
  await expect(frame.locator("[data-grid-cell]")).toHaveCount(6);
  await expect(frame.getByRole("region", { name: "enabled=true, size=large" })).toBeVisible();

  await axes.getByLabel("Columns").selectOption("");
  await expect(frame.locator("[data-grid-cell]")).toHaveCount(2);
  await expect(frame.getByRole("region", { name: "enabled=false" })).toBeVisible();
});

test("칸이 상한을 넘으면 일부만 그리지 않고 안내", async ({ page }) => {
  await openPreview(page, "ColorChip");
  await previewFrame(page);

  await page.getByRole("group", { name: "View" }).getByRole("button", { name: "Matrix" }).click();

  await expect(page.getByRole("status").filter({ hasText: "These axes need 42 previews" })).toBeVisible();
  await expect(page.locator("[data-stage-frame]")).toBeHidden();

  await page.getByRole("group", { name: "Matrix axes" }).getByLabel("Columns").selectOption("");
  await expect(page.locator("[data-stage-frame]")).toBeVisible();
  await expect((await previewFrame(page)).locator("[data-grid-cell]")).toHaveCount(7);
});
