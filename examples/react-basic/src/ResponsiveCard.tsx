// Viewport를 바꾸면 iframe 너비 기준 미디어 쿼리에 따라 배치가 바뀜
const STYLE = `
.responsive-card { display: grid; grid-template-columns: 1fr; gap: 0.75rem; padding: 1rem; font-family: system-ui, sans-serif; }
.responsive-card__wide { display: none; }
@media (min-width: 640px) {
  .responsive-card { grid-template-columns: 1fr 1fr; }
  .responsive-card__narrow { display: none; }
  .responsive-card__wide { display: inline; }
}
`;

/** @preview */
export const ResponsiveCard = () => (
  <>
    <style>{STYLE}</style>
    <div className="responsive-card">
      <strong>Responsive card</strong>
      <span>
        <span className="responsive-card__narrow">Stacked layout</span>
        <span className="responsive-card__wide">Two-column layout</span>
      </span>
    </div>
  </>
);
