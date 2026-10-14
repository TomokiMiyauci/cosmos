"use client";
import type { JSX } from "react";
import {
  type ControlProps,
  useField,
  useValidity,
  useValue,
} from "@cosmos/schema-field";
import { TextInput } from "~component";

export default function TextControl(props: ControlProps): JSX.Element {
  const { required } = props;
  const [value, onChange] = useValue();
  const { id, error, description, label } = useField();
  const { valid } = useValidity();

  return (
    <TextInput
      id={id}
      type="text"
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value || null);
      }}
      required={required}
      aria-describedby={description.id}
      aria-labelledby={label.id}
      aria-errormessage={error.id}
      aria-invalid={!valid}
    />
  );
}
