"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import style from "./date.css" with { type: "css" };
import StyleSheet from "~util";

export default function DateControl(props: ControlProps): JSX.Element {
  const { required, id } = props;
  const [value, setValue] = props.api.useValue();

  return (
    <>
      <StyleSheet href="date">{style}</StyleSheet>
      <input
        data-component="date"
        id={id}
        type="date"
        value={value ?? ""}
        onChange={(ev) => {
          setValue(ev.target.value ?? null);
        }}
        required={required}
      />
    </>
  );
}
