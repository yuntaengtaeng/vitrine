import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

const surfaceColor = (page: import("@playwright/test").Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

test.describe("시스템이 다크 모드", () => {
  test.use({ colorScheme: "dark" });

  test("Gallery는 어둡게, 프리뷰의 Light 배경은 그대로 흰색", async ({ page }) => {
    await openPreview(page, "Badge");
    await previewFrame(page);

    await expect(page.locator("html")).toHaveAttribute("data-vt-theme", "dark");
    expect(await surfaceColor(page)).toBe("rgb(14, 19, 41)");
    await expect(page.locator("[data-stage-frame]")).toHaveCSS("background-color", "rgb(255, 255, 255)");
  });
});

test("시스템이 라이트 모드면 밝게", async ({ page }) => {
  await page.goto("/__vitrine");
  await expect(page.locator("html")).toHaveAttribute("data-vt-theme", "light");
  expect(await surfaceColor(page)).toBe("rgb(255, 255, 255)");
});

test("theme.sync를 맞춘 VS Code에서는 시스템 설정보다 VS Code 테마를 따름", async ({ page, baseURL }) => {
  await page.setContent(`<!doctype html><body style="margin:0">
<iframe src="${baseURL}/__vitrine" style="width:100%;height:600px;border:0"></iframe>
<script>
window.addEventListener("message", (event) => {
  if (event.data?.type !== "capabilitiesRequest") return;
  event.source.postMessage({ type: "capabilitiesResponse", protocol: 1, capabilities: { "theme.sync": 1 } }, "*");
  event.source.postMessage({ type: "themeChanged", kind: "dark" }, "*");
});
</script></body>`);
  const gallery = page.frameLocator("iframe");

  await expect(gallery.locator("html")).toHaveAttribute("data-vt-theme", "dark");
});
