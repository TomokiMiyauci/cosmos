import type { ReferenceNode } from "@cosmos/core";
import type { JSX } from "react";

export interface ReferenceFieldProps {
  node: ReferenceNode;
}

export default function ReferenceField(_: ReferenceFieldProps): JSX.Element {
  return <input />;
}
