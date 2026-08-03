"use client";

import type { JSX } from "react";
import type { OnChange, ReferenceFieldDefinition, Store } from "./type.ts";

export interface ReferenceFieldProps {
  field: ReferenceFieldDefinition;
  onChange: OnChange;
  store: Store;
  id: string;
}

export default function ReferenceField(
  props: ReferenceFieldProps,
): JSX.Element {
  const { field, store, onChange, id } = props;
  const current = store[id];

  if (current && current.type !== "reference") throw new Error();

  const value = current?.value;

  return (
    <select
      onChange={(ev) => {
        const value = ev.target.value;

        store[id] = { type: "reference", value };

        onChange(store);
      }}
      value={value}
    >
      <option></option>
      {field.options.map((option) => {
        return (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        );
      })}
    </select>
  );
}
