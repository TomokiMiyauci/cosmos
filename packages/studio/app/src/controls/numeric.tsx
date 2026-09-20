"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import { Input } from "~component";

export default function NumericControl(props: ControlProps): JSX.Element {
  const { required, id } = props;
  const [value, onChange] = props.api.useValue();

  return (
    <Input
      id={id}
      type="number"
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value ?? null);
      }}
      required={required}
    />
  );
}
