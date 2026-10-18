import { preview } from "vite-plugin-react-vitrine/preview";

/** @preview name="Forms/Switch" */
export const Switch = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
}) => (
  <label className="switch">
    <input type="checkbox" checked={checked} onChange={(event) => onChange?.(event.currentTarget.checked)} />
    <span className="track" />
    {label}
  </label>
);

preview(Switch, {
  args: { label: "Email notifications", checked: true, onChange: () => {} },
});
