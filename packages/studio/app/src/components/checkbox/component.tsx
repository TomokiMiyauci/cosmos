import type { DetailedHTMLProps, InputHTMLAttributes, JSX } from "react";
import { StyleSheet } from "~component";
import style from "./style.css" with { type: "css" };

export default function Checkbox(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
): JSX.Element {
  return (
    <>
      <StyleSheet precedence="" href="checkbox">{style}</StyleSheet>
      <input
        data-component="checkbox"
        type="checkbox"
        {...props}
      />
    </>
  );
}
