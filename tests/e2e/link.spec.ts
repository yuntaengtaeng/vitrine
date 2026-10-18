import { expect, test } from "@playwright/test";
import { openPreview, previewFrame } from "./helpers";

test("주소가 지금 상태를 따라가 새로고침해도 프리뷰, 바꾼 값, globals가 그대로", async ({ page }) => {
  await openPreview(page, "Automatic controls");
  await previewFrame(page);
  await page.getByRole("textbox", { name: "label" }).fill("Linked");
  await page.getByRole("group", { name: "Globals" }).getByLabel("Locale").selectOption("ko");
  await expect(page).toHaveURL(/#preview=.*args=/);

  await page.reload();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Automatic controls");
  await expect(page.getByRole("textbox", { name: "label" })).toHaveValue("Linked");
  await expect((await previewFrame(page)).getByText("Linked", { exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Globals" }).getByLabel("Locale")).toHaveValue("ko");
});

test("Copy link로 복사한 주소를 새 창에서 열면 같은 variant", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await openPreview(page, "Button");
  await previewFrame(page);
  await page.getByRole("group", { name: "Variants" }).getByRole("button", { name: "Danger" }).click();
  await page.getByRole("button", { name: "Copy link" }).click();
  await expect(page.getByText("Link copied")).toBeVisible();
  const url = await page.evaluate(() => navigator.clipboard.readText());

  const other = await context.newPage();
  await other.goto(url);

  await expect(other.getByRole("group", { name: "Variants" }).getByRole("button", { name: "Danger" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect((await previewFrame(other)).getByRole("button", { name: "Delete" })).toBeVisible();
});

test("없는 variant를 담은 링크는 기본 variant로 열림", async ({ page }) => {
  await page.goto(`/__vitrine#preview=${encodeURIComponent("src/Button.tsx#Button")}&variant=ghost`);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Button");
  await expect((await previewFrame(page)).getByRole("button", { name: "Confirm" })).toBeVisible();
});
