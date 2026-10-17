import { createContainer } from "@vanilla-extract/css";

/** Gallery 전체 너비 container, VS Code 패널처럼 창보다 좁게 열려도 레이아웃이 따라감 */
export const galleryContainer = createContainer("gallery");

export const NARROW = `${galleryContainer} (max-width: 640px)`;
