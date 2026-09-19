"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import style from "./numeric.css" with { type: "css" };
import StyleSheet from "~util";

export default function NumericControl(props: ControlProps): JSX.Element {
  const { required, id } = props;
  const [value, onChange] = props.api.useValue();

  return (
    <>
      <StyleSheet precedence="" href="numeric">{style}</StyleSheet>
      <input
        data-component="numeric"
        id={id}
        type="number"
        value={value ?? ""}
        onChange={(ev) => {
          onChange(ev.target.value ?? null);
        }}
        required={required}
      />
    </>
  );
}
