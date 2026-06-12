import type { DatetimeField } from "@cosmos/core";
import type { JSX } from "react";

export interface DatatimeFieldProps {
  field: DatetimeField;
}

export default function DatetimeField(_: DatatimeFieldProps): JSX.Element {
  return <input type="date" />;
}
