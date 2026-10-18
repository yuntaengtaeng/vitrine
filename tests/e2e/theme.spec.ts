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

  test("Dark 배경을 고르면 iframe 뒤까지 어둡게 보임", async ({ page }) => {
    await openPreview(page, "Badge");
    await previewFrame(page);
    await page.getByRole("group", { name: "Background" }).getByRole("button", { name: "Dark background" }).click();

    // CSS 값은 맞아도 브라우저가 iframe 뒤를 흰색으로 칠할 수 있어 실제 픽셀을 읽음
    const box = (await page.locator("[data-stage-frame] iframe").boundingBox())!;
    const shot = await page.screenshot({ clip: { x: box.x + 2, y: box.y + 2, width: 1, height: 1 } });
    const [red, green, blue] = await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return [...context.getImageData(0, 0, 1, 1).data];
    }, `data:image/png;base64,${shot.toString("base64")}`);
    expect(red + green + blue).toBeLessThan(150);
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
