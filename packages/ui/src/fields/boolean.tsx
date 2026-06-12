import type { JSX } from "react";
import type { BooleanField } from "@cosmos/core";

export interface BooleanFieldProps {
  field: BooleanField;
}

export default function BooleanField(
  _: BooleanFieldProps,
): JSX.Element {
  return <input />;
}
