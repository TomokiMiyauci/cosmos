import type { InstanceField } from "@cosmos/core";
import type { JSX } from "react";

export interface InstanceFieldProps {
  field: InstanceField;
}

export default function InstanceField(_: InstanceFieldProps): JSX.Element {
  return <input />;
}
