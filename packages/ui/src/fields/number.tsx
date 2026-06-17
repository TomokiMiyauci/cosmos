"use client";

import type { JSX } from "react";
import type { Node, NumberField } from "@cosmos/core";

export interface NumberFieldProps {
  field: NumberField;
  onChange: (node: Node) => void;
}

export default function NumberField(props: NumberFieldProps): JSX.Element {
  const { onChange } = props;

  return (
    <input
      type="number"
      onChange={(ev) => {
        const value = Number(ev.target.value);

        onChange({ type: "number", value });
      }}
    />
  );
}
