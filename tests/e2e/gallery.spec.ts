import { expect, test, type Page } from "@playwright/test";

const openPreview = async (page: Page, name: string) => {
  await page.goto("/__vitrine");
  await page.getByRole("button", { name, exact: true }).click();
  await expect(page.getByRole("button", { name, exact: true })).toHaveAttribute("aria-current", "true");
};

test("예제 앱의 @preview export를 사이드바에 표시", async ({ page }) => {
  await page.goto("/__vitrine");
  for (const name of ["Button", "Danger button", "Themed panel", "Automatic controls"]) {
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();
  }
});

test("variant 전환이 프리뷰에 반영", async ({ page }) => {
  await openPreview(page, "Button");
  await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();

  const variants = page.getByRole("group", { name: "Variants" });
  await variants.getByRole("button", { name: "Danger" }).click();

  await expect(variants.getByRole("button", { name: "Danger" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
});

test("radio control은 방향키로 다음 옵션 선택", async ({ page }) => {
  await openPreview(page, "Button");
  const group = page.getByRole("radiogroup", { name: "variant" });

  await group.getByRole("radio", { name: "primary" }).focus();
  await page.keyboard.press("ArrowRight");

  await expect(group.getByRole("radio", { name: "danger" })).toHaveAttribute("aria-checked", "true");
  await expect(group.getByRole("radio", { name: "danger" })).toBeFocused();
  await expect(page.getByRole("button", { name: "Delete" })).toBeVisible();
});

test("text control 변경이 프리뷰에 반영", async ({ page }) => {
  await openPreview(page, "Automatic controls");
  await page.getByRole("textbox", { name: "label" }).fill("Hello from e2e");
  await expect(page.getByText("Hello from e2e", { exact: true })).toBeVisible();
});

test("control을 바꿔도 setup file Provider의 state 유지", async ({ page }) => {
  await openPreview(page, "Themed panel");
  await page.getByRole("button", { name: "Use dark mode" }).click();
  await expect(page.getByRole("button", { name: "Use light mode" })).toBeVisible();

  await page.getByRole("textbox", { name: "title" }).fill("Renamed panel");

  await expect(page.getByText("Renamed panel", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Use light mode" })).toBeVisible();
});
