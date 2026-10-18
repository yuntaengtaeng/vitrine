import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

const locale = (page: import("@playwright/test").Page) =>
  page.getByRole("group", { name: "Globals" }).getByLabel("Locale");

test("toolbar에서 고른 global이 setup wrapper로 전달되고 다른 프리뷰와 reload 뒤에도 유지", async ({ page }) => {
  await openPreview(page, "Greeting");
  const frame = await previewFrame(page);
  await expect(frame.getByText("Hello, Vitrine")).toBeVisible();

  await locale(page).selectOption("ko");
  await expect(frame.getByText("안녕하세요, Vitrine")).toBeVisible();

  await openPreview(page, "Badge");
  await expect(locale(page)).toHaveValue("ko");
  await page.reload();
  await openPreview(page, "Greeting");
  await expect((await previewFrame(page)).getByText("안녕하세요, Vitrine")).toBeVisible();
});

test("variant가 고정한 global은 toolbar에서 바꿀 수 없음", async ({ page }) => {
  await openPreview(page, "Greeting");
  const frame = await previewFrame(page);
  await page.getByRole("group", { name: "Variants" }).getByRole("button", { name: "Always Korean" }).click();

  await expect(locale(page)).toBeDisabled();
  await expect(locale(page)).toHaveValue("ko");
  await expect(frame.getByText("안녕하세요, Vitrine")).toBeVisible();
});

test("global을 바꾸면 Provider를 새로 마운트", async ({ page }) => {
  await openPreview(page, "Themed panel");
  const frame = await previewFrame(page);
  await frame.getByRole("button", { name: "Use dark mode" }).click();
  await expect(frame.getByRole("button", { name: "Use light mode" })).toBeVisible();

  await locale(page).selectOption("ko");

  await expect(frame.getByRole("button", { name: "Use dark mode" })).toBeVisible();
});
