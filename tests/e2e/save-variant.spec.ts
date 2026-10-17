import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

test("VS Code와 variant.save를 맞추면 지금 값을 variant로 저장하는 편집을 확장에 보냄", async ({ page, baseURL }) => {
  // VS Code webview 대신 handshake에 답하고 받은 편집을 보관했다가 성공으로 답하는 부모 문서
  await page.setContent(`<!doctype html><body style="margin:0">
<iframe src="${baseURL}/__vitrine" style="width:1280px;height:760px;border:0"></iframe>
<script>
window.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.type === "capabilitiesRequest") {
    event.source.postMessage({ type: "capabilitiesResponse", protocol: 1, capabilities: { "variant.save": 1 } }, "*");
  }
  if (data?.type === "saveVariant") {
    window.savedVariant = data;
    event.source.postMessage({ type: "saveVariantResult", ok: true, key: data.key }, "*");
  }
});
</script></body>`);
  const gallery = page.frameLocator("iframe");
  await gallery.getByRole("navigation", { name: "Previews" }).getByRole("button", { name: "Toast", exact: true }).click();
  await expect(gallery.locator('iframe[data-frame-state="ready"]')).toBeAttached();
  await gallery.getByRole("textbox", { name: "message" }).fill("Undo sent");

  await gallery.getByRole("button", { name: "Save as variant" }).click();
  await gallery.getByRole("textbox", { name: "Variant name" }).fill("Short");
  await gallery.getByRole("button", { name: "Save", exact: true }).click();

  await expect(gallery.getByText("Saved as short")).toBeVisible();
  const saved = await page.evaluate(() => (window as unknown as { savedVariant: { file: string; edits: { text: string }[] } }).savedVariant);
  expect(saved.file).toMatch(/Toast\.tsx$/);
  expect(saved.edits.map((edit) => edit.text).join("")).toContain('short: { name: "Short", args: { message: "Undo sent" } }');
});

test("브라우저 단독으로 열면 Save as variant가 없음", async ({ page }) => {
  await openPreview(page, "Toast");
  await previewFrame(page);
  await expect(page.getByRole("tab", { name: "Props" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Save as variant" })).toHaveCount(0);
});
