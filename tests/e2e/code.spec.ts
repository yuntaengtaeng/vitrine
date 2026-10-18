import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

const openCodeTab = async (page: Parameters<typeof openPreview>[0]) => {
  await page.getByRole("tablist", { name: "Panel" }).getByRole("tab", { name: "Code" }).click();
  return page.getByRole("tabpanel", { name: "Code" });
};

test("Code 탭은 지금 variant와 바꾼 값을 JSX로 보여줌", async ({ page }) => {
  await openPreview(page, "Button");
  await previewFrame(page);
  await page.getByRole("group", { name: "Variants" }).getByRole("button", { name: "Danger" }).click();

  const code = await openCodeTab(page);
  await expect(code.locator("code")).toHaveText('<Button variant="danger" />');
});

test("고른 탭은 다른 프리뷰에서도 유지", async ({ page }) => {
  await openPreview(page, "Button");
  await previewFrame(page);
  await openCodeTab(page);

  await openPreview(page, "Automatic controls");
  await expect(page.getByRole("tab", { name: "Code" })).toHaveAttribute("aria-selected", "true");
});

test("함수 prop은 코드에 넣지 못한다고 알림", async ({ page }) => {
  await openPreview(page, "Toast");
  await previewFrame(page);

  const code = await openCodeTab(page);
  await expect(code.locator("code")).toHaveText('<Toast message="Changes saved" />');
  await expect(code.getByText(/Not shown: onUndo/)).toBeVisible();
});

test("Copy는 코드를 클립보드에 복사", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openPreview(page, "Button");
  await previewFrame(page);

  const code = await openCodeTab(page);
  await code.getByRole("button", { name: "Copy" }).click();

  await expect(code.getByRole("status")).toHaveText("Copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('<Button variant="primary" />');
});
