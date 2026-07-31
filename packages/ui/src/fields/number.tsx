"use client";

import type { JSX } from "react";
import type {
  EditNumber,
  NumberFieldDefinition,
  OnChange,
  Store,
} from "./type.ts";

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
        const maybeNode = rawValue !== ""
          ? { type: "number", value: Number(rawValue) } satisfies EditNumber
          : null;

        onChange((prev) => {
          const newStore = { ...prev };

          if (maybeNode) {
            return {
              ...newStore,
              [id]: maybeNode,
            };
          } else {
            delete newStore[id];

            return newStore;
          }
        });
      }}
    />
  );
}
