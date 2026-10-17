import { expect, test, type Page } from "@playwright/test";

const openButtonPreview = async (page: Page) => {
  await page.goto("/__vitrine");
  await page.getByRole("button", { name: "Button", exact: true }).click();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
};

const frame = (page: Page) => page.locator("[data-stage-frame]");

test("배경을 바꾸면 무대 프레임 배경이 바뀜", async ({ page }) => {
  await openButtonPreview(page);
  const backgrounds = page.getByRole("group", { name: "Background" });

  await backgrounds.getByRole("button", { name: "Dark background" }).click();

  await expect(backgrounds.getByRole("button", { name: "Dark background" })).toHaveAttribute("aria-pressed", "true");
  await expect(frame(page)).toHaveAttribute("data-background", "dark");
});

test("frame width 프리셋은 프레임 너비를 고정하고 크기를 표시", async ({ page }) => {
  await openButtonPreview(page);
  await page.getByLabel("Frame width").selectOption("375");

  await expect(page.locator("[data-stage-width-label]")).toHaveText("375px");
  await expect.poll(async () => (await frame(page).boundingBox())?.width).toBe(375);
});

test("무대 설정은 다른 프리뷰와 새로고침 뒤에도 유지", async ({ page }) => {
  await openButtonPreview(page);
  await page.getByRole("button", { name: "Transparent background" }).click();
  await page.getByLabel("Frame width").selectOption("768");

  await page.getByRole("button", { name: "Badge", exact: true }).click();
  await expect(frame(page)).toHaveAttribute("data-background", "transparent");

  await page.reload();
  await expect(frame(page)).toHaveAttribute("data-background", "transparent");
  await expect(page.getByLabel("Frame width")).toHaveValue("768");
});
