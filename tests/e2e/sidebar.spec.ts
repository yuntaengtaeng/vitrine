import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/__vitrine");
});

test("검색어로 사이드바 프리뷰를 거르고 Escape로 초기화", async ({ page }) => {
  const sidebar = page.getByRole("navigation", { name: "Previews" });
  const search = sidebar.getByRole("searchbox", { name: "Search previews" });

  await search.fill("danger");
  await expect(sidebar.getByRole("button", { name: "Danger button", exact: true })).toBeVisible();
  await expect(sidebar.getByRole("button", { name: "Themed panel", exact: true })).toBeHidden();

  await search.press("Escape");
  await expect(search).toHaveValue("");
  await expect(sidebar.getByRole("button", { name: "Themed panel", exact: true })).toBeVisible();
});

test("/ 키로 검색창에 focus", async ({ page }) => {
  await page.getByRole("navigation", { name: "Previews" }).click({ position: { x: 5, y: 5 } });
  await page.keyboard.press("/");
  await expect(page.getByRole("searchbox", { name: "Search previews" })).toBeFocused();
});

test("검색 결과가 없으면 안내 표시", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Search previews" }).fill("no-such-preview");
  await expect(page.getByRole("navigation", { name: "Previews" }).getByRole("status")).toHaveText(
    "No previews match “no-such-preview”",
  );
});

test("group을 접고 펼치기", async ({ page }) => {
  const sidebar = page.getByRole("navigation", { name: "Previews" });
  const cards = sidebar.getByRole("button", { name: /^Cards/ });

  await expect(cards).toHaveAttribute("aria-expanded", "true");
  await cards.click();
  await expect(cards).toHaveAttribute("aria-expanded", "false");
  await expect(sidebar.getByRole("button", { name: "Short card", exact: true })).toBeHidden();

  await cards.click();
  await expect(sidebar.getByRole("button", { name: "Short card", exact: true })).toBeVisible();
});

test.describe("좁은 패널", () => {
  test.use({ viewport: { width: 420, height: 760 } });

  test("사이드바는 서랍으로 열고, 프리뷰를 고르거나 Escape를 누르면 닫힘", async ({ page }) => {
    await page.goto("/__vitrine");
    const sidebar = page.getByRole("navigation", { name: "Previews" });
    const menu = page.getByRole("button", { name: "Previews" });
    await expect(sidebar).toBeHidden();

    await menu.click();
    await sidebar.getByRole("button", { name: "Badge", exact: true }).click();
    await expect(sidebar).toBeHidden();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Badge");

    await menu.click();
    await expect(sidebar).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sidebar).toBeHidden();
  });
});
