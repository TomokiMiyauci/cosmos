"use client";

import type { JSX } from "react";
import type { BooleanField, BooleanNode, Node } from "@cosmos/core";

export interface BooleanFieldProps {
  field: BooleanField;
  node: BooleanNode | null;
  onChange: (node: Node) => void;
}

export default function BooleanField(
  props: BooleanFieldProps,
): JSX.Element {
  const { node, onChange } = props;

  return (
    <input
      type="checkbox"
      onChange={(ev) => {
        const value = ev.target.checked;

        onChange({ type: "boolean", value });
      }}
      checked={node?.value}
    />
  );
}
