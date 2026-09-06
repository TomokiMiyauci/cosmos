"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function CheckboxControl(props: ControlProps): JSX.Element {
  const { required } = props;
  const [value, onChange] = props.api.useValue();

  return (
    <input
      type="checkbox"
      checked={value === "true"}
      onChange={(ev) => {
        const checked = ev.target.checked;

        onChange(checked.toString());
      }}
      required={required}
    />
  );
}
