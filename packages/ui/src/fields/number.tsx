"use client";

import type { JSX } from "react";
import type { Node, NumberField, NumberNode } from "@cosmos/core";

export interface NumberFieldProps {
  field: NumberField;
  node: NumberNode | null;
  onChange: (node: Node) => void;
}

export default function NumberField(props: NumberFieldProps): JSX.Element {
  const { onChange, node } = props;

  return (
    <input
      type="number"
      onChange={(ev) => {
        const value = Number(ev.target.value);

        onChange({ type: "number", value });
      }}
      value={node?.value}
    />
  );
}
