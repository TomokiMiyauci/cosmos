"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function TextControl(props: ControlProps): JSX.Element {
  const { api, required } = props;
  const [value, onChange] = api.useValue();

  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(ev) => {
        const value = ev.target.value;
        const input = value ? value : null;

        onChange(input);
      }}
      required={required}
    />
  );
}
