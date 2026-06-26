import type { Node } from "@cosmos/core";
import type { Field } from "../type.ts";
import type { JSX } from "react";

export interface OnChange {
  (node: Node | null): void;
}

export interface FieldProps {
  node: Node | null;
  onChange: OnChange;
  field: Field;
}

export interface RenderField {
  (props: FieldProps): JSX.Element;
}
