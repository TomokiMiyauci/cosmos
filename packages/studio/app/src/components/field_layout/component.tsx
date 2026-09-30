import type { JSX } from "react";
import {
  type FieldLayoutProps,
  useField,
  useValidity,
} from "@cosmos/schema-field";
import style from "./style.css" with { type: "css" };
import { StyleSheet } from "~component";

export default function FieldLayout(props: FieldLayoutProps): JSX.Element {
  const { title, control } = props;

  const { id, label, error: { id: errorId } } = useField();
  const { error } = useValidity();

  return (
    <>
      <StyleSheet>{style}</StyleSheet>

      <div data-component="field-layout">
        <label id={label.id} htmlFor={id}>{title}</label>

        {control}

        {error !== null && <p id={errorId}>{error}</p>}
      </div>
    </>
  );
}
