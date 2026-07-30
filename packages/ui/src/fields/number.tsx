"use client";

import type { JSX } from "react";
import type { NumberFieldDefinition, OnChange, Store } from "./type.ts";

export interface NumberFieldProps {
  field: NumberFieldDefinition;
  onChange: OnChange;
  error?: string;
  store: Store;
  id: string;
}

export default function NumberField(props: NumberFieldProps): JSX.Element {
  const { onChange, field, store, id } = props;
  const maybeNode = store[id];
  const currentValue = maybeNode?.type === "number" ? maybeNode.value : "";

  return (
    <input
      type="number"
      placeholder={field.placeholder}
      value={currentValue}
      onChange={(ev) => {
        const rawValue = ev.target.value;
        onChange((prev) => ({
          ...prev,
          [id]: rawValue !== ""
            ? { type: "number", value: Number(rawValue) }
            : null,
        }));
      }}
    />
  );
}
