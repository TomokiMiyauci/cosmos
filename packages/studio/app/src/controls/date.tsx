"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import { TextInput } from "~component";

export default function DateControl(props: ControlProps): JSX.Element {
  const { required, id } = props;
  const [value, setValue] = props.api.useValue();

  return (
    <TextInput
      id={id}
      type="date"
      value={value ?? ""}
      onChange={(ev) => {
        setValue(ev.target.value ?? null);
      }}
      required={required}
    />
  );
}
