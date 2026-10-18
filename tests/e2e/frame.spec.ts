import { expect, test } from "@playwright/test";

const frameUrl = (id: string) => `/__vitrine/frame?id=${encodeURIComponent(id)}`;

test("frame 페이지를 단독으로 열어도 첫 variant로 프리뷰 렌더링", async ({ page }) => {
  await page.goto(frameUrl("src/Button.tsx#Button"));
  await expect(page.locator('[data-vitrine-frame="ready"]')).toBeVisible();
  await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
});

test("frame에서 setup file Provider가 적용됨", async ({ page }) => {
  await page.goto(frameUrl("src/ThemedPanel.tsx#ThemedPanel"));
  await page.getByRole("button", { name: "Use dark mode" }).click();
  await expect(page.getByRole("button", { name: "Use light mode" })).toBeVisible();
});

test("모르는 preview id는 frame 안에 에러 표시", async ({ page }) => {
  await page.goto(frameUrl("src/Missing.tsx#Missing"));
  await expect(page.locator('[data-vitrine-frame="error"]')).toContainText('No @preview export with id "src/Missing.tsx#Missing"');
});

test("Gallery가 보낸 render 상태로 variant와 바꾼 값을 반영하고 ready, size를 알림", async ({ page }) => {
  await page.route("**/frame-host", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<iframe id="frame" src="${frameUrl("src/Button.tsx#Button")}" style="width:600px;height:300px;border:0"></iframe>
        <script>
          window.received = [];
          addEventListener("message", (event) => {
            if (event.source !== document.getElementById("frame").contentWindow) return;
            window.received.push(event.data);
            if (event.data.type === "frameReady") {
              event.source.postMessage(
                { type: "frameRender", protocol: 1, variantKey: "danger", args: {}, layout: { kind: "single" }, globals: {} },
                location.origin,
              );
            }
          });
        </script>`,
    }),
  );
  await page.goto("/frame-host");

  const frame = page.frameLocator("#frame");
  await expect(frame.getByRole("button", { name: "Delete" })).toBeVisible();

  const types = await page.evaluate(() => (window as unknown as { received: { type: string }[] }).received.map((m) => m.type));
  expect(types).toContain("frameReady");
  expect(types).toContain("frameSize");
});
