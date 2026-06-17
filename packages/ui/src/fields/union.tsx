import type { UnionField } from "@cosmos/core";
import type { JSX } from "react";

export interface UnionFieldProps {
  field: UnionField;
}

export default function UnionField(_: UnionFieldProps): JSX.Element {
  return <input />;
}
