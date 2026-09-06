"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function NumericControl(props: ControlProps): JSX.Element {
  const { required } = props;
  const [value, onChange] = props.api.useValue();

  return (
    <input
      type="number"
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value);
      }}
      required={required}
    />
  );
}
