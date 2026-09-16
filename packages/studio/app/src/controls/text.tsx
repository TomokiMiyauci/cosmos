"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function TextControl(props: ControlProps): JSX.Element {
  const { api, required, id } = props;
  const [value, onChange] = api.useValue();

  return (
    <input
      id={id}
      type="text"
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value ?? null);
      }}
      required={required}
    />
  );
}
