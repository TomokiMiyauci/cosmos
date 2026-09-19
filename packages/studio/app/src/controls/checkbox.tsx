"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import style from "./checkbox.css" with { type: "css" };
import StyleSheet from "~util";

export default function CheckboxControl(props: ControlProps): JSX.Element {
  const { required, id } = props;
  const [value, onChange] = props.api.useValue();

  return (
    <>
      <StyleSheet>{style}</StyleSheet>
      <input
        data-component="checkbox"
        id={id}
        type="checkbox"
        checked={value === "true"}
        onChange={(ev) => {
          const checked = ev.target.checked;

          onChange(checked.toString());
        }}
        required={required}
      />
    </>
  );
}
