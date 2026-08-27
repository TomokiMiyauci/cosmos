"use client";
import type { JSX } from "react";
import type { WidgetProps } from "./type.ts";

export default function CheckboxWidget(props: WidgetProps): JSX.Element {
  return (
    <input
      type="checkbox"
      checked={props.value === "true"}
      onChange={(ev) => {
        const checked = ev.target.checked;

        props.onChange(checked.toString());
      }}
    />
  );
}
