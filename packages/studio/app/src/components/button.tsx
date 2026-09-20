import type { ButtonHTMLAttributes, DetailedHTMLProps, JSX } from "react";
import style from "./button.css" with { type: "css" };
import StyleSheet from "~util";

export default function Button(
  props: DetailedHTMLProps<
    ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >,
): JSX.Element {
  return (
    <>
      <StyleSheet href="button" precedence="">{style}</StyleSheet>
      <button data-component="button" {...props}></button>
    </>
  );
}
