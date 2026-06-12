import type { UnionField } from "@cosmos/core";
import type { JSX } from "react";

export interface DatatimeFieldProps {
  field: UnionField;
}

export default function DatetimeField(_: DatatimeFieldProps): JSX.Element {
  return <input type="date" />;
}
