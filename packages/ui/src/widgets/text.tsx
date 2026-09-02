"use client";
import type { JSX } from "react";
import type { WidgetProps } from "@cosmos/schema-field";

export default function TextWidget(props: WidgetProps): JSX.Element {
  const [value, onChange] = props.api.useValue();

  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value);
      }}
    />
  );
}
