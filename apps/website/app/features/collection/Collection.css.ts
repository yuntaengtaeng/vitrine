import { style } from "@vanilla-extract/css";
import { vars } from "../../styles/theme.css";

const WIDE = "(min-width: 900px)";

// 전시 벽처럼 큰 작품과 작은 작품을 엇갈려 거는 배치
export const wall = style({
  display: "grid",
  gridTemplateColumns: "minmax(0, 1fr)",
  gap: "clamp(3rem, 7vw, 5.5rem) 3rem",
  margin: "clamp(3rem, 7vw, 4.5rem) 0 0",
  padding: 0,
  listStyle: "none",
  "@media": { [WIDE]: { gridTemplateColumns: "repeat(12, minmax(0, 1fr))" } },
});

export const exhibit = style({
  display: "grid",
  alignContent: "start",
  gap: "1.5rem",
  "@media": {
    [WIDE]: {
      gridColumn: "span 6",
      selectors: {
        "&:nth-child(4n + 1)": { gridColumn: "1 / span 7" },
        "&:nth-child(4n + 2)": { gridColumn: "8 / span 5", marginTop: "6rem" },
        "&:nth-child(4n + 3)": { gridColumn: "1 / span 5", marginTop: "-2rem" },
        "&:nth-child(4n + 4)": { gridColumn: "6 / span 7", marginTop: "3rem" },
      },
    },
  },
});

export const label = style({
  display: "grid",
  gap: "0.75rem",
  maxWidth: "44ch",
});

export const text = style({
  margin: 0,
  color: vars.color.textMuted,
});

export const notes = style({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "2rem",
  margin: "clamp(4rem, 9vw, 6rem) 0 0",
  padding: "2.5rem 0 0",
  borderTop: `1px solid ${vars.color.border}`,
  listStyle: "none",
});

export const note = style({
  display: "grid",
  alignContent: "start",
  gap: "0.75rem",
});
