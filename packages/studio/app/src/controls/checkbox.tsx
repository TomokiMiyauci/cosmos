"use client";
import type { JSX } from "react";
import { type ControlProps, useField } from "@cosmos/schema-field";
import { Checkbox } from "~component";

export default function CheckboxControl(props: ControlProps): JSX.Element {
  const { required } = props;
  const [value, onChange] = props.api.useValue();
  const { id, description, error, label } = useField();

  return (
    <Checkbox
      id={id}
      checked={value === "true"}
      onChange={(ev) => {
        const checked = ev.target.checked;

        onChange(checked.toString());
      }}
      required={required}
      aria-describedby={description.id}
      aria-labelledby={label.id}
      aria-errormessage={error.id}
    />
  );
}
