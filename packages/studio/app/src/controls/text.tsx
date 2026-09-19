"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import style from "./text.css" with { type: "css" };
import StyleSheet from "~util";

export default function TextControl(props: ControlProps): JSX.Element {
  const { api, required, id } = props;
  const [value, onChange] = api.useValue();

  return (
    <>
      <StyleSheet precedence="" href="text">{style}</StyleSheet>
      <input
        data-component="text"
        id={id}
        type="text"
        value={value ?? ""}
        onChange={(ev) => {
          onChange(ev.target.value ?? null);
        }}
        required={required}
      />
    </>
  );
}
