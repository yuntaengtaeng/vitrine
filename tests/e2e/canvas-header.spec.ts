import { expect, test } from "@playwright/test";
import { openPreview } from "./helpers";

test("머리말에 프리뷰 이름, group 경로, 파일 표시", async ({ page }) => {
  await page.goto("/__vitrine");
  await page.getByRole("button", { name: "Danger button", exact: true }).click();

  const header = page.getByRole("banner");
  await expect(header.getByRole("heading", { level: 1 })).toHaveText("Danger button");
  await expect(header.getByText("Inputs", { exact: true })).toBeVisible();
  await expect(header.getByText("src/Button.tsx", { exact: true })).toBeVisible();
});

test("Open in editor는 preview id로 dev server에 요청", async ({ page }) => {
  // 실제 에디터가 열리지 않도록 요청만 확인
  let requestedUrl = "";
  await page.route("**/__vitrine/open-in-editor?**", async (route) => {
    requestedUrl = route.request().url();
    await route.fulfill({ status: 204 });
  });
  await openPreview(page, "Danger button");
  await page.getByRole("button", { name: "Open in editor" }).click();

  await expect.poll(() => new URL(requestedUrl || "http://x").searchParams.get("id")).toBe("src/Button.tsx#DangerButton");
});

test("모르는 preview id의 open-in-editor 요청은 404", async ({ request }) => {
  const response = await request.get("/__vitrine/open-in-editor?id=src%2FMissing.tsx%23Missing");
  expect(response.status()).toBe(404);
});

test("iframe 안의 Gallery에서는 Open in editor를 숨김", async ({ page }) => {
  await page.route("**/embed-test", (route) =>
    route.fulfill({ contentType: "text/html", body: '<iframe src="/__vitrine" style="width:1000px;height:600px"></iframe>' }),
  );
  await page.goto("/embed-test");
  const gallery = page.frameLocator("iframe");
  await gallery.getByRole("button", { name: "Button", exact: true }).click();

  await expect(gallery.getByRole("heading", { level: 1 })).toHaveText("Button");
  await expect(gallery.getByRole("button", { name: "Open in editor" })).toHaveCount(0);
});
