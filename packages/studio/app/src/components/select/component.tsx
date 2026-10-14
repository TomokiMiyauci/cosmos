import type { DetailedHTMLProps, JSX, SelectHTMLAttributes } from "react";
import { StyleSheet } from "~component";
import style from "./style.css" with { "type": "css" };

export default function Select(
  props: DetailedHTMLProps<
    SelectHTMLAttributes<HTMLSelectElement>,
    HTMLSelectElement
  >,
): JSX.Element {
  return (
    <>
      <StyleSheet href="select" precedence="">{style}</StyleSheet>
      <select data-component="select" {...props} />
    </>
  );
}
