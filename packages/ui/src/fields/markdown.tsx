import type { JSX } from "react";
import type { MarkdownField } from "@cosmos/core";

export interface MarkdownFieldProps {
  field: MarkdownField;
}

export default function MarkdownField(props: MarkdownFieldProps): JSX.Element {
  return <input type="text" />;
}
