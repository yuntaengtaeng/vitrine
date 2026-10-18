import { expect, type FrameLocator, type Page } from "@playwright/test";

/** Gallery 사이드바에서 프리뷰를 선택하고 선택 표시까지 확인 */
export async function openPreview(page: Page, name: string, galleryUrl = "/__vitrine"): Promise<void> {
  if (!page.url().includes(galleryUrl)) await page.goto(galleryUrl);
  const item = page.getByRole("navigation", { name: "Previews" }).getByRole("button", { name, exact: true });
  await item.click();
  await expect(item).toHaveAttribute("aria-current", "true");
  // 새 프리뷰의 frame이 준비될 때까지 이전 화면이 남아 있으므로 바뀔 때까지 기다림
  await expect(page.locator("[data-canvas-pending]")).toHaveCount(0);
}

/** 프리뷰 iframe이 frameReady를 보낼 때까지 기다린 뒤 frame 안을 가리키는 locator 반환 */
export async function previewFrame(page: Page): Promise<FrameLocator> {
  await expect(page.locator('iframe[data-frame-state="ready"]')).toBeAttached();
  return page.frameLocator("iframe[data-frame-state]");
}
