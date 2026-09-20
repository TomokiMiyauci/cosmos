import type { JSX } from "react";
import type { FieldLayoutProps } from "@cosmos/schema-field";
import style from "./style.css" with { type: "css" };
import StyleSheet from "~util";

export default function FieldLayout(props: FieldLayoutProps): JSX.Element {
  const { id, title, error, control } = props;

  return (
    <>
      <StyleSheet>{style}</StyleSheet>

      <div data-component="field-layout">
        <label htmlFor={id}>{title}</label>

        {control}

        {error !== null && <p>{error}</p>}
      </div>
    </>
  );
}
