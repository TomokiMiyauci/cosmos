import type { JSX } from "react";
import type { NumberField } from "@cosmos/core";

export interface NumberFieldProps {
  field: NumberField;
}

export default function NumberField(_: NumberFieldProps): JSX.Element {
  return <input type="number" />;
}
