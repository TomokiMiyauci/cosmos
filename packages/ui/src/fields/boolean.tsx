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
  const { onChange, store, id, field } = props;
  const maybeNode = store[id];
  const currentValue = maybeNode?.type === "boolean" ? maybeNode.value : false;

  return (
    <>
      <label>
        <p>{field.title}</p>
        <input
          type="checkbox"
          onChange={(ev) => {
            const value = ev.target.checked;

            const newStore = {
              ...store,
              [id]: { type: "boolean" as const, value },
            };

            onChange(newStore);
          }}
          checked={currentValue}
        />
      </label>
    </>
  );
}
