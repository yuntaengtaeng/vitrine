import { expect, test, type Page } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

const breakPreview = async (page: Page) => {
  await openPreview(page, "ErrorDemo");
  await previewFrame(page);
  await page.getByRole("switch", { name: "shouldThrow" }).click();
};

test("렌더 에러는 메시지를 먼저 보여주고 stack은 접어 둠", async ({ page }) => {
  await breakPreview(page);
  const card = page.getByRole("alert", { name: "Preview error" });

  await expect(card.getByText("ErrorDemo was asked to throw")).toBeVisible();
  const stack = card.locator("details");
  await expect(stack).not.toHaveAttribute("open");
  await stack.getByText("Stack trace").click();
  await expect(stack.locator("pre")).toContainText("ErrorDemo");
  await expect(page.locator("[data-stage-frame]")).toBeHidden();
});

test("값을 되돌리면 에러 카드와 사이드바 오류 점이 사라짐", async ({ page }) => {
  await breakPreview(page);
  const item = page.getByRole("navigation", { name: "Previews" }).getByRole("button", { name: "ErrorDemo", exact: true });
  await expect(item.locator("[data-preview-failed]")).toBeVisible();

  await page.getByRole("switch", { name: "shouldThrow" }).click();

  await expect(page.getByRole("alert", { name: "Preview error" })).toBeHidden();
  await expect((await previewFrame(page)).getByText("Turn on shouldThrow to see the error card")).toBeVisible();
  await expect(item.locator("[data-preview-failed]")).toHaveCount(0);
});

test("다른 프리뷰로 옮겨도 실패한 프리뷰의 오류 점은 남음", async ({ page }) => {
  await breakPreview(page);
  await expect(page.getByRole("alert", { name: "Preview error" })).toBeVisible();
  await openPreview(page, "Badge");

  const item = page.getByRole("navigation", { name: "Previews" }).getByRole("button", { name: "ErrorDemo", exact: true });
  await expect(item.locator("[data-preview-failed]")).toBeVisible();
});

test("에러 카드의 Open in editor는 프리뷰 파일을 요청", async ({ page }) => {
  let requestedId: string | null = null;
  await page.route("**/__vitrine/open-in-editor?**", async (route) => {
    requestedId = new URL(route.request().url()).searchParams.get("id");
    await route.fulfill({ status: 204 });
  });
  await breakPreview(page);

  await page.getByRole("alert", { name: "Preview error" }).getByRole("button", { name: "Open in editor" }).click();

  await expect.poll(() => requestedId).toBe("src/ErrorDemo.tsx#ErrorDemo");
});
