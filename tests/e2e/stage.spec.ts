import { expect, test, type Page } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

const openButtonPreview = async (page: Page) => {
  await openPreview(page, "Button");
  await expect((await previewFrame(page)).getByRole("button", { name: "Confirm" })).toBeVisible();
};

const frame = (page: Page) => page.locator("[data-stage-frame]");

test("배경을 바꾸면 무대 프레임 배경이 바뀜", async ({ page }) => {
  await openButtonPreview(page);
  const backgrounds = page.getByRole("group", { name: "Background" });

  await backgrounds.getByRole("button", { name: "Dark background" }).click();

  await expect(backgrounds.getByRole("button", { name: "Dark background" })).toHaveAttribute("aria-pressed", "true");
  await expect(frame(page)).toHaveAttribute("data-background", "dark");
});

test("viewport 프리셋은 iframe 너비를 고정하고 크기를 표시", async ({ page }) => {
  await openButtonPreview(page);
  await page.getByLabel("Viewport").selectOption("Mobile");

  await expect(page.locator("[data-stage-width-label]")).toHaveText("375px");
  await expect.poll(async () => (await page.locator("iframe[data-frame-state]").boundingBox())?.width).toBe(375);
});

test("프리뷰의 미디어 쿼리는 viewport 너비를 따름", async ({ page }) => {
  await openPreview(page, "ResponsiveCard");
  const preview = await previewFrame(page);

  await page.getByLabel("Viewport").selectOption("Mobile");
  await expect(preview.getByText("Stacked layout")).toBeVisible();
  await expect(preview.getByText("Two-column layout")).toBeHidden();

  // 사용자가 vitrine({ viewports })로 추가한 viewport
  await page.getByLabel("Viewport").selectOption("Breakpoint");
  await expect(page.locator("[data-stage-width-label]")).toHaveText("800px");
  await expect(preview.getByText("Two-column layout")).toBeVisible();
});

test("무대 설정은 다른 프리뷰와 새로고침 뒤에도 유지", async ({ page }) => {
  await openButtonPreview(page);
  await page.getByRole("button", { name: "Transparent background" }).click();
  await page.getByLabel("Viewport").selectOption("Tablet");

  await openPreview(page, "Badge");
  await expect(frame(page)).toHaveAttribute("data-background", "transparent");

  await page.reload();
  await expect(frame(page)).toHaveAttribute("data-background", "transparent");
  await expect(page.getByLabel("Viewport")).toHaveValue("Tablet");
});

test("frame이 늦게 뜨면 로딩 표시 후 프리뷰로 바뀜", async ({ page }) => {
  await page.route("**/__vitrine/frame?**", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await route.continue();
  });
  await openPreview(page, "Badge");

  await expect(page.getByRole("status").filter({ hasText: "Loading preview" })).toBeVisible();
  await expect((await previewFrame(page)).getByText("New", { exact: true })).toBeVisible();
  await expect(page.getByText("Loading preview")).toHaveCount(0);
});
