import { expect, test, type Page } from "@playwright/test";

type Answer = "none" | { protocol: number };

// VS Code webview처럼 다른 origin의 부모 문서가 Gallery를 iframe으로 띄우고 handshake에 답함
const embedGallery = async (page: Page, baseURL: string | undefined, answer: Answer) => {
  const reply =
    answer === "none"
      ? ""
      : `if (event.data?.type === "capabilitiesRequest") event.source.postMessage({ type: "capabilitiesResponse", protocol: ${answer.protocol}, capabilities: {} }, "*");`;
  await page.setContent(`<!doctype html><body style="margin:0">
<iframe src="${baseURL}/__vitrine" style="width:100%;height:600px;border:0"></iframe>
<script>window.addEventListener("message", (event) => { ${reply} });</script></body>`);
  return page.frameLocator("iframe");
};

test("확장의 handshake protocol이 낮으면 확장 업데이트를 안내", async ({ page, baseURL }) => {
  const gallery = await embedGallery(page, baseURL, { protocol: 0 });
  await expect(gallery.getByRole("status").filter({ hasText: "Update the Vitrine VS Code extension" })).toBeVisible();
});

test("plugin 쪽 protocol이 낮으면 plugin 업데이트를 안내", async ({ page, baseURL }) => {
  const gallery = await embedGallery(page, baseURL, { protocol: 99 });
  await expect(gallery.getByRole("status").filter({ hasText: "Update vite-plugin-react-vitrine" })).toBeVisible();
});

for (const [name, answer] of [
  ["응답이 없는 옛 확장", "none"],
  ["protocol이 같은 확장", { protocol: 1 }],
] as const) {
  test(`${name}에서는 업데이트를 안내하지 않음`, async ({ page, baseURL }) => {
    const gallery = await embedGallery(page, baseURL, answer);
    await expect(gallery.getByRole("navigation", { name: "Previews" })).toBeVisible();
    // 응답을 기다리는 시간이 지난 뒤에도 안내가 없어야 함
    await page.waitForTimeout(1800);
    await expect(gallery.getByText(/to use every gallery feature/)).toHaveCount(0);
  });
}
