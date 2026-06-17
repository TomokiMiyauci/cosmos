/// <reference lib="dom" />

"use client";

import type { JSX } from "react";
import type { Node, StringField, StringNode } from "@cosmos/core";

export interface StringFieldProps {
  field: StringField;
  node: StringNode | null;
  onChange: (node: Node) => void;
}

export default function StringField(props: StringFieldProps): JSX.Element {
  const { onChange, node } = props;

  return (
    <input
      type="text"
      value={node?.value}
      onChange={(ev) => {
        onChange({ type: "string", value: ev.target.value });
      }}
    />
  );
}
