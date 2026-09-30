"use client";
import type { JSX } from "react";
import { type ControlProps, useField } from "@cosmos/schema-field";
import { TextInput } from "~component";

export default function NumericControl(props: ControlProps): JSX.Element {
  const { required } = props;
  const [value, onChange] = props.api.useValue();
  const { id, description, label, error } = useField();

  return (
    <TextInput
      id={id}
      type="number"
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value || null);
      }}
      required={required}
      aria-describedby={description.id}
      aria-labelledby={label.id}
      aria-errormessage={error.id}
    />
  );
}
