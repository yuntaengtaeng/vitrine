import type { CSSProperties } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_FAMILY } from "../../../tokens/fontFamily";
import { FONT_SIZE } from "../../../tokens/fontSize";

const STARTER = `/** @preview */
export const Button = () => <button>Click me</button>;`;

const includeExample = (include: readonly string[]) =>
  `vitrine({ include: [${[...include, "packages/ui/**/*.tsx"].map((pattern) => `"${pattern}"`).join(", ")}] })`;

const Styled = {
  Root: {
    maxWidth: 560,
    margin: "0 auto",
    padding: "4rem 2rem",
    color: COLOR.body,
    fontSize: FONT_SIZE.base,
    lineHeight: 1.6,
  } satisfies CSSProperties,
  Heading: { margin: "0 0 0.5rem", fontSize: "1.1rem", fontWeight: 650 } satisfies CSSProperties,
  Text: { margin: "1.25rem 0 0.5rem", color: COLOR.muted } satisfies CSSProperties,
  Patterns: { margin: 0, paddingLeft: "1.25rem" } satisfies CSSProperties,
  Code: {
    margin: 0,
    padding: "0.75rem 1rem",
    borderRadius: 8,
    background: COLOR.surfaceSubtle,
    border: `1px solid ${COLOR.border}`,
    fontFamily: FONT_FAMILY.mono,
    fontSize: FONT_SIZE.label,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  } satisfies CSSProperties,
  Inline: { fontFamily: FONT_FAMILY.mono, fontSize: FONT_SIZE.label } satisfies CSSProperties,
};

export const EmptyGallery = (props: { include: readonly string[] }) => (
  <section style={Styled.Root} aria-labelledby="vitrine-empty-heading">
    <h1 id="vitrine-empty-heading" style={Styled.Heading}>
      No previews yet
    </h1>
    <p style={Styled.Text}>Mark an exported component with a preview comment and save the file.</p>
    <pre style={Styled.Code}>{STARTER}</pre>
    <p style={Styled.Text}>Vitrine looks for previews in these files, relative to the Vite root:</p>
    <ul style={Styled.Patterns}>
      {props.include.map((pattern) => (
        <li key={pattern}>
          <code style={Styled.Inline}>{pattern}</code>
        </li>
      ))}
    </ul>
    <p style={Styled.Text}>If your components live elsewhere, add their folders in vite.config:</p>
    <pre style={Styled.Code}>{includeExample(props.include)}</pre>
  </section>
);
