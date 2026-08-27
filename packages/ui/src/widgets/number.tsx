"use client";
import type { JSX } from "react";
import type { WidgetProps } from "./type.ts";

export default function NumberWidget(props: WidgetProps): JSX.Element {
  return (
    <input
      type="number"
      defaultValue={props.value ?? ""}
      onChange={(ev) => {
        props.onChange(ev.target.value);
      }}
    />
  );
}
