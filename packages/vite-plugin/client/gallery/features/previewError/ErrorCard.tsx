import type { CSSProperties } from "react";
import { COLOR } from "../../../tokens/color";
import { FONT_FAMILY } from "../../../tokens/fontFamily";
import { FONT_SIZE } from "../../../tokens/fontSize";
import { SECONDARY_BUTTON } from "../../shared/ui/buttonStyle";
import { stackFrames, type PreviewFailure } from "./errorDetails";

const Styled = {
  Root: {
    width: "100%",
    maxWidth: 720,
    padding: "1rem 1.25rem",
    border: `1px solid ${COLOR.errorBorder}`,
    borderRadius: 8,
    background: COLOR.errorBg,
    boxSizing: "border-box",
  } satisfies CSSProperties,
  Header: { display: "flex", alignItems: "flex-start", gap: "1rem" } satisfies CSSProperties,
  Titles: { display: "grid", gap: 6, minWidth: 0, flex: 1 } satisfies CSSProperties,
  Title: { margin: 0, fontSize: FONT_SIZE.label, fontWeight: 650, color: COLOR.error } satisfies CSSProperties,
  Message: {
    margin: 0,
    fontFamily: FONT_FAMILY.mono,
    fontSize: FONT_SIZE.base,
    color: COLOR.body,
    whiteSpace: "pre-wrap",
    overflowWrap: "anywhere",
  } satisfies CSSProperties,
  Details: { marginTop: "0.85rem" } satisfies CSSProperties,
  Summary: { cursor: "pointer", fontSize: FONT_SIZE.label, color: COLOR.muted } satisfies CSSProperties,
  Stack: {
    margin: "0.5rem 0 0",
    maxHeight: 260,
    overflow: "auto",
    fontFamily: FONT_FAMILY.mono,
    fontSize: FONT_SIZE.label,
    color: COLOR.muted,
    whiteSpace: "pre",
  } satisfies CSSProperties,
  LibraryFrame: { opacity: 0.55 } satisfies CSSProperties,
};

export const ErrorCard = (props: { failure: PreviewFailure; onOpenInEditor?: () => void }) => {
  const frames = stackFrames(props.failure, window.location.origin);
  return (
    <section role="alert" aria-label="Preview error" style={Styled.Root}>
      <div style={Styled.Header}>
        <div style={Styled.Titles}>
          <h2 style={Styled.Title}>This preview failed to render</h2>
          <p style={Styled.Message}>{props.failure.message}</p>
        </div>
        {props.onOpenInEditor && (
          <button type="button" style={SECONDARY_BUTTON} onClick={props.onOpenInEditor}>
            Open in editor
          </button>
        )}
      </div>
      {frames.length > 0 && (
        <details style={Styled.Details}>
          <summary style={Styled.Summary}>Stack trace</summary>
          <pre style={Styled.Stack}>
            {frames.map((frame, index) => (
              <div key={index} style={frame.library ? Styled.LibraryFrame : undefined}>
                {frame.text}
              </div>
            ))}
          </pre>
        </details>
      )}
    </section>
  );
};
