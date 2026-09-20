"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import { Input } from "~component";

export default function TextControl(props: ControlProps): JSX.Element {
  const { api, required, id } = props;
  const [value, onChange] = api.useValue();

  return (
    <Input
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
