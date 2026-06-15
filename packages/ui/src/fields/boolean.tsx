"use client";

import type { JSX } from "react";
import type { BooleanNode, Node } from "@cosmos/core";

export interface BooleanFieldProps {
  node: BooleanNode;
  onChange: (node: Node) => void;
}

export default function BooleanField(
  props: BooleanFieldProps,
): JSX.Element {
  const { node, onChange } = props;

  return (
    <input
      type="checkbox"
      checked={node.value}
      onChange={(ev) => {
        const value = ev.target.checked;

        onChange({ ...node, value });
      }}
    />
  );
}
