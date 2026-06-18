import type { JSX } from "react";
import type { MarkdownField, MarkdownNode, Node } from "@cosmos/core";

export interface MarkdownFieldProps {
  field: MarkdownField;
  node: MarkdownNode | null;
  onChange: (node: Node) => void;
}

export default function MarkdownField(props: MarkdownFieldProps): JSX.Element {
  const { node, onChange } = props;

  return (
    <input
      type="text"
      value={node?.value ? JSON.stringify(node.value) : ""}
      onChange={(e) => {
        const value = e.target.value;
      }}
    />
  );
}
