"use client";

import type { JSX } from "react";
import type { Node, NumberNode } from "@cosmos/core";
import type { NumberField } from "../type.ts";

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
      value={node?.value ?? ""}
    />
  );
}
