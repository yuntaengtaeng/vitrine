/** @preview */
export const ErrorDemo = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) throw new Error("ErrorDemo was asked to throw");
  return <p style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>Turn on shouldThrow to see the error card</p>;
};
