import type { JSX } from "react";
import type { Node, StringField } from "@cosmos/core";

export interface StringFieldProps {
  field: StringField;
  node: Node | undefined;
}

export default function StringField(props: StringFieldProps): JSX.Element {
  const { node } = props;

  if (node) {
    if (node.type !== "string") throw new Error();

    return <input type="text" defaultValue={node.value} />;
  }

  return <input type="text" />;
}
