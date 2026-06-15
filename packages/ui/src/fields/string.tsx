/// <reference lib="dom" />

"use client";

import type { JSX } from "react";
import type { Node, StringNode } from "@cosmos/core";

export interface StringFieldProps {
  node: StringNode;
  name?: string;
  onChange: (node: Node) => void;
}

export default function StringField(props: StringFieldProps): JSX.Element {
  const { node, onChange } = props;

  return (
    <input
      type="text"
      value={node.value}
      onChange={(ev) => {
        onChange({ ...node, value: ev.target.value });
      }}
    />
  );
}
