import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const OUT_DIR = path.resolve("apps/website/public/screenshots");
const CROP_WIDTH = 1000;

/** 사이트 카드에 넣을 부분, 전체 화면은 작게 줄이면 읽을 수 없음 */
type Crop = "toolbar-stage" | "stage-panel" | "panel";

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

async function box(page: Page, selector: string) {
  const found = await page.locator(selector).first().boundingBox();
  if (!found) throw new Error(`${selector} is not visible`);
  return found;
}

async function cropArea(page: Page, crop: Crop) {
  const frame = await box(page, "[data-stage-frame]");
  const tabs = await box(page, '[role="tablist"]');
  const panel = await box(page, '[role="tabpanel"]');
  const left = frame.x - 32;
  const width = frame.width + 64;
  if (crop === "panel") return { x: left, y: tabs.y - 12, width, height: panel.y + panel.height - tabs.y + 12 };
  if (crop === "stage-panel") return { x: left, y: frame.y - 32, width, height: panel.y + panel.height - frame.y + 32 };
  const toolbar = await box(page, '[role="group"][aria-label="View"]');
  const bottom = Math.min(frame.y + frame.height + 32, tabs.y - 13);
  return { x: left, y: toolbar.y - 14, width, height: bottom - toolbar.y + 14 };
}

async function capture(page: Page, name: string, crop?: Crop) {
  // 로딩 표시와 hover가 사라지고 frame 높이가 맞춰질 때까지 기다림
  await page.mouse.move(0, 0);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
  if (!crop) return;
  // 카드 크기로 줄여도 컴포넌트가 읽히도록 좁은 화면에서 다시 찍음
  const viewport = page.viewportSize();
  if (viewport) await page.setViewportSize({ width: CROP_WIDTH, height: viewport.height });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(OUT_DIR, `${name}-crop.png`), clip: await cropArea(page, crop) });
}

test.beforeAll(() => fs.mkdirSync(OUT_DIR, { recursive: true }));

test("gallery", async ({ page }) => {
  await open(page, "Button");
  await capture(page, "gallery", "panel");
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
  await capture(page, "variants", "toolbar-stage");
});

test("matrix", async ({ page }) => {
  await open(page, "Button");
  await selectView(page, "Matrix");
  const axes = page.getByRole("group", { name: "Matrix axes" });
  await axes.getByLabel("Rows").selectOption("tone");
  await axes.getByLabel("Columns").selectOption("size");
  await capture(page, "matrix", "toolbar-stage");
});

test("actions", async ({ page }) => {
  // 기록 두 줄과 토스트만 담기도록 무대와 패널의 빈 공간을 줄임
  await page.setViewportSize({ width: 1280, height: 470 });
  await page.addInitScript(() => localStorage.setItem("vitrine:panel", JSON.stringify({ height: 150, collapsed: false })));
  const frame = await open(page, "Toast");
  await page.getByRole("tab", { name: "Actions" }).click();
  await frame.getByRole("button", { name: "Undo" }).click();
  await frame.getByRole("button", { name: "Dismiss" }).click();
  await capture(page, "actions", "stage-panel");
});

test("globals", async ({ page }) => {
  await open(page, "Profile card");
  await page.getByLabel("Locale").selectOption("ko");
  await capture(page, "globals", "toolbar-stage");
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
    await capture(page, "history", "toolbar-stage");
  } finally {
    fs.writeFileSync(file, original);
  }
});
