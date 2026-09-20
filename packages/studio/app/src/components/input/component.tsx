import type { DetailedHTMLProps, InputHTMLAttributes, JSX } from "react";
import StyleSheet from "~util";
import style from "./style.css" with { type: "css" };

export default function Input(
  props: DetailedHTMLProps<
    InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >,
): JSX.Element {
  return (
    <>
      <StyleSheet precedence="" href="input">{style}</StyleSheet>
      <input
        data-component="input"
        {...props}
      />
    </>
  );
}
