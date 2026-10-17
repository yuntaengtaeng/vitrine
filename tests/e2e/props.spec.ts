import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

test("prop 이름 아래 타입을 표시", async ({ page }) => {
  await openPreview(page, "Automatic controls");
  const panel = page.getByRole("complementary", { name: "Props" });

  await expect(panel.getByText("string", { exact: true })).toBeVisible();
  await expect(panel.getByText("boolean", { exact: true })).toBeVisible();
});

test("Reset은 그 prop만 variant 값으로 되돌림", async ({ page }) => {
  await openPreview(page, "Automatic controls");
  const frame = await previewFrame(page);
  const panel = page.getByRole("complementary", { name: "Props" });
  await expect(panel.getByRole("button", { name: "Reset label" })).toHaveCount(0);

  await panel.getByRole("textbox", { name: "label" }).fill("Changed label");
  await expect(frame.getByText("Changed label", { exact: true })).toBeVisible();

  await panel.getByRole("button", { name: "Reset label" }).click();

  await expect(panel.getByRole("textbox", { name: "label" })).toHaveValue("");
  await expect(frame.getByText("Type a label", { exact: true })).toBeVisible();
  await expect(panel.getByRole("button", { name: "Reset label" })).toHaveCount(0);
  await expect(panel.getByRole("button", { name: "Reset all" })).toHaveCount(0);
});

test("Reset all은 바꾼 prop을 모두 되돌림", async ({ page }) => {
  await openPreview(page, "Automatic controls");
  const frame = await previewFrame(page);
  const panel = page.getByRole("complementary", { name: "Props" });

  await panel.getByRole("textbox", { name: "label" }).fill("Changed label");
  await panel.getByRole("switch", { name: "enabled" }).click();
  await panel.getByRole("button", { name: "Reset all" }).click();

  await expect(frame.getByText("Type a label", { exact: true })).toBeVisible();
  await expect(panel.getByRole("button", { name: /^Reset / })).toHaveCount(0);
});
