"use client";
import type { JSX } from "react";
import type { WidgetProps } from "./type.ts";

export default function TextWidget(props: WidgetProps): JSX.Element {
  return (
    <input
      type="text"
      defaultValue={props.value ?? ""}
      onChange={(ev) => {
        props.onChange(ev.target.value);
      }}
    />
  );
}
