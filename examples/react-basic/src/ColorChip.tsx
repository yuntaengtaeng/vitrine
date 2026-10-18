const HUES = { red: 0, orange: 30, yellow: 50, green: 140, teal: 175, blue: 220, violet: 270 } as const;
const LIGHTNESS = { 1: 92, 2: 80, 3: 66, 4: 52, 5: 40, 6: 28 } as const;

/** @preview */
export const ColorChip = ({ hue, shade }: { hue: keyof typeof HUES; shade: 1 | 2 | 3 | 4 | 5 | 6 }) => (
  <span
    style={{
      display: "inline-block",
      width: 48,
      height: 24,
      borderRadius: 6,
      background: `hsl(${HUES[hue]} 70% ${LIGHTNESS[shade]}%)`,
    }}
  />
);
