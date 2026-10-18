import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const OUT_DIR = path.resolve("apps/website/public/screenshots");

async function open(page: Page, name: string) {
  if (!page.url().includes("/__vitrine")) await page.goto("/__vitrine");
  await page.getByRole("navigation", { name: "Previews" }).getByRole("button", { name, exact: true }).click();
  await expect(page.locator("[data-canvas-pending]")).toHaveCount(0);
  await expect(page.locator('iframe[data-frame-state="ready"]')).toBeAttached();
  return page.frameLocator("iframe[data-frame-state]");
}

async function selectView(page: Page, view: string) {
  await page.getByRole("group", { name: "View" }).getByRole("button", { name: view }).click();
}

async function capture(page: Page, name: string) {
  // 로딩 표시와 hover가 사라지고 frame 높이가 맞춰질 때까지 기다림
  await page.mouse.move(0, 0);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
}

test.beforeAll(() => fs.mkdirSync(OUT_DIR, { recursive: true }));

test("gallery", async ({ page }) => {
  await open(page, "Button");
  await capture(page, "gallery");
});

test("gallery dark", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await open(page, "Profile card");
  await page.getByLabel("Theme").selectOption("dark");
  await page.getByRole("group", { name: "Background" }).getByRole("button", { name: "Dark background" }).click();
  await capture(page, "gallery-dark");
});

test("variants", async ({ page }) => {
  await open(page, "Button");
  await selectView(page, "Variants");
  await capture(page, "variants");
});

test("matrix", async ({ page }) => {
  await open(page, "Button");
  await selectView(page, "Matrix");
  const axes = page.getByRole("group", { name: "Matrix axes" });
  await axes.getByLabel("Rows").selectOption("tone");
  await axes.getByLabel("Columns").selectOption("size");
  await capture(page, "matrix");
});

test("actions", async ({ page }) => {
  const frame = await open(page, "Toast");
  await page.getByRole("tab", { name: "Actions" }).click();
  await frame.getByRole("button", { name: "Undo" }).click();
  await frame.getByRole("button", { name: "Dismiss" }).click();
  await capture(page, "actions");
});

test("globals", async ({ page }) => {
  await open(page, "Profile card");
  await page.getByLabel("Locale").selectOption("ko");
  await capture(page, "globals");
});

test("history", async ({ page }) => {
  const file = path.resolve("examples/showcase/src/Toast.tsx");
  const original = fs.readFileSync(file, "utf8");
  try {
    const frame = await open(page, "Toast");
    fs.writeFileSync(file, original.replace('message: "Post published"', 'message: "Post scheduled for 9:00"'));
    await expect(frame.getByText("Post scheduled for 9:00")).toBeVisible();
    await selectView(page, "History");
    await expect(frame.locator("[data-grid-cell]")).toHaveCount(2);
    await capture(page, "history");
  } finally {
    fs.writeFileSync(file, original);
  }
});
