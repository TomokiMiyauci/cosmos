import type { JSX } from "react";
import type { StringNode } from "@cosmos/client";

export interface StringFieldProps {
  node: StringNode;
}

export default function StringField(props: StringFieldProps): JSX.Element {
  const { node } = props;

  return <input type="text" defaultValue={node.value} />;
}
