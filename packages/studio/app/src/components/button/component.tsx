import type { ButtonHTMLAttributes, DetailedHTMLProps, JSX } from "react";
import style from "./style.css" with { type: "css" };
import { StyleSheet } from "~component";

export default function Button(
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
): JSX.Element {
  return (
    <button {...props}>
      <StyleSheet>{style}</StyleSheet>

      {props.children}
    </button>
  );
}
