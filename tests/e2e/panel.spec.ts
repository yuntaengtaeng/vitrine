import { expect, test, type Page } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

const panelHeight = async (page: Page) =>
  (await page.getByRole("separator", { name: "Resize panel" }).locator("..").boundingBox())!.height;

test("탭을 바꿔도 패널 높이는 그대로", async ({ page }) => {
  await openPreview(page, "Toast");
  await previewFrame(page);
  const height = await panelHeight(page);

  await page.getByRole("tab", { name: "Actions" }).click();
  expect(await panelHeight(page)).toBe(height);
  await page.getByRole("tab", { name: "Code" }).click();
  expect(await panelHeight(page)).toBe(height);
});

test("경계를 끌어 높이를 바꾸면 reload 뒤에도 유지", async ({ page }) => {
  await openPreview(page, "Toast");
  await previewFrame(page);
  const before = await panelHeight(page);
  const box = (await page.getByRole("separator", { name: "Resize panel" }).boundingBox())!;

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 80, { steps: 4 });
  await page.mouse.up();
  const after = await panelHeight(page);
  expect(after).toBeCloseTo(before + 80, -1);

  await page.reload();
  await previewFrame(page);
  expect(await panelHeight(page)).toBeCloseTo(after, 0);
});

test("패널을 접으면 탭 줄만 남고 탭을 누르면 다시 펼침", async ({ page }) => {
  await openPreview(page, "Toast");
  await previewFrame(page);

  await page.getByRole("button", { name: "Collapse panel" }).click();
  await expect(page.getByRole("tabpanel")).toBeHidden();
  await expect(page.getByRole("separator", { name: "Resize panel" })).toHaveCount(0);

  await page.getByRole("tab", { name: "Code" }).click();
  await expect(page.getByRole("tabpanel", { name: "Code" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Collapse panel" })).toBeVisible();
});
