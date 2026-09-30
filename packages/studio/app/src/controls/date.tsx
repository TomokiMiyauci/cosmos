"use client";
import type { JSX } from "react";
import { type ControlProps, useField } from "@cosmos/schema-field";
import { TextInput } from "~component";

export default function DateControl(props: ControlProps): JSX.Element {
  const { required } = props;
  const [value, setValue] = props.api.useValue();
  const { id, description, error, label } = useField();

  return (
    <TextInput
      id={id}
      type="date"
      value={value ?? ""}
      onChange={(ev) => {
        setValue(ev.target.value || null);
      }}
      required={required}
      aria-describedby={description.id}
      aria-labelledby={label.id}
      aria-errormessage={error.id}
    />
  );
}
