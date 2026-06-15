import type { UnionNode } from "@cosmos/core";
import type { JSX } from "react";

export interface UnionFieldProps {
  node: UnionNode;
}

export default function UnionField(_: UnionFieldProps): JSX.Element {
  return <input />;
}
