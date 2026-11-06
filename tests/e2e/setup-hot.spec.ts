import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

// 모든 프리뷰가 쓰는 setup file을 고치므로 playwright.config의 setup-hot project로 다른 test 뒤에 실행
const setupFile = path.resolve("examples/react-basic/src/vitrine.preview.tsx");
const localeProviderFile = path.resolve("examples/react-basic/src/LocaleProvider.tsx");
const originals = new Map([setupFile, localeProviderFile].map((file) => [file, fs.readFileSync(file, "utf-8")]));

test.describe.configure({ mode: "serial" });
test.afterEach(() => {
  for (const [file, content] of originals) fs.writeFileSync(file, content);
});

const markLoaded = (page: Page) => page.evaluate(() => Object.assign(window, { vitrineNotReloaded: true }));
const stillLoaded = (page: Page) => page.evaluate(() => "vitrineNotReloaded" in window);
const locale = (page: Page) => page.getByRole("group", { name: "Globals" }).getByLabel("Locale");

test("setup file을 고치면 앱 page는 reload되지 않고 Gallery에 새 globals가 반영됨", async ({ page, context }) => {
  const app = await context.newPage();
  await app.goto("/");
  await markLoaded(app);
  await openPreview(page, "Greeting");
  await expect((await previewFrame(page)).getByText("Hello, Vitrine")).toBeVisible();
  await markLoaded(page);

  fs.writeFileSync(setupFile, originals.get(setupFile)!.replace('options: ["en", "ko"]', 'options: ["en", "ko", "ja"]'));

  await expect(locale(page).locator("option", { hasText: "ja" })).toHaveCount(1);
  await expect((await previewFrame(page)).getByText("Hello, Vitrine")).toBeVisible();
  expect(await stillLoaded(app)).toBe(true);
  expect(await stillLoaded(page)).toBe(true);
});

test("setup file이 import하는 컴포넌트가 아닌 export를 고쳐도 앱 page와 Gallery가 reload되지 않음", async ({ page, context }) => {
  const app = await context.newPage();
  await app.goto("/");
  await markLoaded(app);
  await openPreview(page, "Greeting");
  await expect((await previewFrame(page)).getByText("Hello, Vitrine")).toBeVisible();
  await markLoaded(page);

  // useLocale hook export 때문에 LocaleProvider는 React Refresh 경계가 아니어서 갱신이 setup까지 올라감
  const hotUpdated = page.waitForEvent("console", (message) => message.text().includes("hot updated"));
  fs.writeFileSync(localeProviderFile, `${originals.get(localeProviderFile)}\n// edited by setup-hot e2e\n`);
  await hotUpdated;

  await expect((await previewFrame(page)).getByText("Hello, Vitrine")).toBeVisible();
  expect(await stillLoaded(app)).toBe(true);
  expect(await stillLoaded(page)).toBe(true);
});
