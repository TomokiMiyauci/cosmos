"use client";

import type { JSX } from "react";
import type { BooleanField, Node } from "@cosmos/core";

export interface BooleanFieldProps {
  field: BooleanField;
  onChange: (node: Node) => void;
}

export default function BooleanField(
  props: BooleanFieldProps,
): JSX.Element {
  const { field, onChange } = props;

  return (
    <input
      type="checkbox"
      onChange={(ev) => {
        const value = ev.target.checked;

        onChange({ type: "boolean", value });
      }}
    />
  );
}
