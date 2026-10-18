import type { FrameControl } from "@vitrine/protocol";
import { BooleanControl } from "./BooleanControl";
import { NumberControl } from "./NumberControl";
import { RadioControl } from "./RadioControl";
import { SelectControl } from "./SelectControl";
import { TextControl } from "./TextControl";

export const ControlInput = (props: {
  name: string;
  control: FrameControl;
  value: unknown;
  onChange: (value: unknown) => void;
}) => {
  const { name, control, value, onChange } = props;
  switch (control.type) {
    case "boolean":
      return <BooleanControl label={name} value={value} onChange={onChange} />;
    case "number":
      return <NumberControl label={name} value={value} onChange={onChange} />;
    case "radio":
      return <RadioControl label={name} value={value} options={control.options ?? []} onChange={onChange} />;
    case "select":
      return (
        <SelectControl
          label={name}
          value={value}
          options={control.options ?? []}
          optional={control.optional}
          onChange={onChange}
        />
      );
    default:
      return <TextControl label={name} value={value} onChange={onChange} />;
  }
};
