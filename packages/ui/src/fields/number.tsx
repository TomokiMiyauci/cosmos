"use client";

import type { JSX } from "react";
import type {
  EditNumber,
  ErrorMap,
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
  errors: ErrorMap;
}

export default function NumberField(props: NumberFieldProps): JSX.Element {
  const { onChange, field, store, id, errors } = props;
  const maybeNode = store[id];
  const error = errors[id];
  const currentValue = maybeNode?.type === "number" ? maybeNode.value : "";

  return (
    <>
      <input
        type="number"
        placeholder={field.placeholder}
        value={currentValue}
        onChange={(ev) => {
          const rawValue = ev.target.value;
          const maybeNode = rawValue !== ""
            ? { type: "number", value: Number(rawValue) } satisfies EditNumber
            : null;

          const newStore = { ...store };

          if (maybeNode) {
            const newValue = {
              ...newStore,
              [id]: maybeNode,
            };
            onChange(newValue);
          } else {
            delete newStore[id];

            onChange(newStore);
          }
        }}
      />
      {error && <p>{error}</p>}
    </>
  );
}
