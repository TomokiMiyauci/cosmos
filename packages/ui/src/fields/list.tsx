import type { JSX } from "react";
import type { ListField } from "@cosmos/core";

export interface ListFieldProps {
  field: ListField;
}

export default function ListField(_: ListFieldProps): JSX.Element {
  return <input />;
}
