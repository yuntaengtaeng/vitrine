import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

test("예제 앱의 @preview export를 사이드바에 표시", async ({ page }) => {
  await page.goto("/__vitrine");
  const sidebar = page.getByRole("navigation", { name: "Previews" });
  for (const name of ["Button", "Danger button", "Themed panel", "Automatic controls"]) {
    await expect(sidebar.getByRole("button", { name, exact: true })).toBeVisible();
  }
});

test("variant 전환이 프리뷰에 반영", async ({ page }) => {
  await openPreview(page, "Button");
  const frame = await previewFrame(page);
  await expect(frame.getByRole("button", { name: "Confirm" })).toBeVisible();

  const variants = page.getByRole("group", { name: "Variants" });
  await variants.getByRole("button", { name: "Danger" }).click();

  await expect(variants.getByRole("button", { name: "Danger" })).toHaveAttribute("aria-pressed", "true");
  await expect(frame.getByRole("button", { name: "Delete" })).toBeVisible();
});

test("radio control은 방향키로 다음 옵션 선택", async ({ page }) => {
  await openPreview(page, "Button");
  const frame = await previewFrame(page);
  const group = page.getByRole("radiogroup", { name: "variant" });

  await group.getByRole("radio", { name: "primary" }).focus();
  await page.keyboard.press("ArrowRight");

  await expect(group.getByRole("radio", { name: "danger" })).toHaveAttribute("aria-checked", "true");
  await expect(group.getByRole("radio", { name: "danger" })).toBeFocused();
  await expect(frame.getByRole("button", { name: "Delete" })).toBeVisible();
});

test("text control 변경이 프리뷰에 반영", async ({ page }) => {
  await openPreview(page, "Automatic controls");
  const frame = await previewFrame(page);
  await page.getByRole("textbox", { name: "label" }).fill("Hello from e2e");
  await expect(frame.getByText("Hello from e2e", { exact: true })).toBeVisible();
});

test("control을 바꿔도 setup file Provider의 state 유지", async ({ page }) => {
  await openPreview(page, "Themed panel");
  const frame = await previewFrame(page);
  await frame.getByRole("button", { name: "Use dark mode" }).click();
  await expect(frame.getByRole("button", { name: "Use light mode" })).toBeVisible();

  await page.getByRole("textbox", { name: "title" }).fill("Renamed panel");

  await expect(frame.getByText("Renamed panel", { exact: true })).toBeVisible();
  await expect(frame.getByRole("button", { name: "Use light mode" })).toBeVisible();
});

test("Gallery 문서에는 사용자 module과 CSS가 들어오지 않음", async ({ page }) => {
  const requested: string[] = [];
  page.on("request", (request) => {
    if (request.frame() === page.mainFrame()) requested.push(new URL(request.url()).pathname);
  });
  await openPreview(page, "Button");
  await previewFrame(page);

  expect(requested.filter((path) => path.startsWith("/src/"))).toEqual([]);
});
