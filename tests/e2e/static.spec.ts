import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

// vitrine-static build 결과를 dev server 없이 하위 경로에 올린 상태
const GALLERY_URL = "http://localhost:5199/gallery/";

test("정적 빌드 Gallery는 dev server 없이 프리뷰를 렌더링하고 값을 바꿀 수 있음", async ({ page }) => {
  await openPreview(page, "Button", GALLERY_URL);
  const frame = await previewFrame(page);
  await expect(frame.getByRole("button", { name: "Publish" })).toBeVisible();

  await page.getByRole("textbox", { name: "children" }).fill("Ship it");
  await expect(frame.getByRole("button", { name: "Ship it" })).toBeVisible();

  await page.getByRole("group", { name: "Globals" }).getByLabel("Theme").selectOption("dark");
  await expect(frame.locator('[data-theme="dark"]')).toBeAttached();
});

test("정적 빌드에서는 dev server가 필요한 기능을 보여주지 않고 dev server 경로도 요청하지 않음", async ({ page }) => {
  const devRequests: string[] = [];
  page.on("request", (request) => {
    if (request.url().includes("/__vitrine")) devRequests.push(request.url());
  });
  await openPreview(page, "Toast", GALLERY_URL);
  const frame = await previewFrame(page);
  await page.getByRole("tab", { name: "Actions" }).click();
  await frame.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("list", { name: "Action calls" }).getByRole("listitem")).toHaveCount(1);

  await expect(page.getByRole("button", { name: "Copy link" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Open in editor" })).toHaveCount(0);
  expect(devRequests).toEqual([]);
});

test("정적 빌드에서도 상태 링크로 같은 프리뷰와 값을 엶", async ({ page }) => {
  await openPreview(page, "Button", GALLERY_URL);
  await previewFrame(page);
  await page.getByRole("group", { name: "Variants" }).getByRole("button", { name: "Danger" }).click();
  await expect(page).toHaveURL(/#preview=.*variant=danger/);

  await page.reload();

  await expect((await previewFrame(page)).getByRole("button", { name: "Delete" })).toBeVisible();
});
