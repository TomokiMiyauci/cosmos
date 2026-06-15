import type { JSX } from "react";
import type { MarkdownNode } from "@cosmos/core";

export interface MarkdownFieldProps {
  node: MarkdownNode;
}

export default function MarkdownField(props: MarkdownFieldProps): JSX.Element {
  const { node } = props;

  return <input type="text" defaultValue={JSON.stringify(node.value)} />;
}
