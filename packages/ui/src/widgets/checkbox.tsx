"use client";
import type { JSX } from "react";
import type { WidgetProps } from "@cosmos/schema-field";

export default function CheckboxWidget(props: WidgetProps): JSX.Element {
  const [value, onChange] = props.api.useValue();

  return (
    <input
      type="checkbox"
      checked={value === "true"}
      onChange={(ev) => {
        const checked = ev.target.checked;

        onChange(checked.toString());
      }}
    />
  );
}
