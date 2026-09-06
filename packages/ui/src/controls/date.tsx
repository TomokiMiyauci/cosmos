"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function DateControl(props: ControlProps): JSX.Element {
  const { required } = props;
  const [value, setValue] = props.api.useValue();

  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(ev) => {
        setValue(ev.target.value);
      }}
      required={required}
    />
  );
}
