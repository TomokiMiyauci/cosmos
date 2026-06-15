"use client";

import type { JSX } from "react";
import type { Node, NumberNode } from "@cosmos/core";

export interface NumberFieldProps {
  node: NumberNode;
  onChange: (node: Node) => void;
}

export default function NumberField(props: NumberFieldProps): JSX.Element {
  const { node, onChange } = props;
  const { value } = node;

  return (
    <input
      type="number"
      value={value}
      onChange={(ev) => {
        const value = Number(ev.target.value);

        onChange({ ...node, value });
      }}
    />
  );
}
