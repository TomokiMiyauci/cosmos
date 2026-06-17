import type { ReferenceField } from "@cosmos/core";
import type { JSX } from "react";

export interface ReferenceFieldProps {
  field: ReferenceField;
}

export default function ReferenceField(_: ReferenceFieldProps): JSX.Element {
  return <input />;
}
