"use client";
import type { JSX } from "react";
import type { WidgetProps } from "@cosmos/schema-field";

export default function DateWidget(props: WidgetProps): JSX.Element {
  const [value, setValue] = props.api.useValue();

  return (
    <input
      type="date"
      value={value ?? ""}
      onChange={(ev) => {
        setValue(ev.target.value);
      }}
    />
  );
}
