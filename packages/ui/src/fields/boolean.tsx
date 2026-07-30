"use client";

import type { JSX } from "react";
import type { BooleanFieldDefinition, OnChange, Store } from "./type.ts";

export interface BooleanFieldProps {
  field: BooleanFieldDefinition;
  onChange: OnChange;
  error?: string;
  store: Store;
  id: string;
}

export default function BooleanField(
  props: BooleanFieldProps,
): JSX.Element {
  const { onChange, store, id } = props;
  const maybeNode = store[id];
  const currentValue = maybeNode?.type === "boolean" ? maybeNode.value : false;

  return (
    <input
      type="checkbox"
      onChange={(ev) => {
        const value = ev.target.checked;

        onChange((prev) => ({
          ...prev,
          [id]: { type: "boolean", value },
        }));
      }}
      checked={currentValue}
    />
  );
}
