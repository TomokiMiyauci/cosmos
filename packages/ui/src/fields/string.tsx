/// <reference lib="dom" />

"use client";

import type { JSX } from "react";
import type {
  EditString,
  OnChange,
  Store,
  StringFieldDefinition,
} from "./type.ts";

export interface StringFieldProps {
  field: StringFieldDefinition;
  onChange: OnChange;
  error?: string;
  store: Store;
  id: string;
}

export default function StringField(props: StringFieldProps): JSX.Element {
  const { onChange, field, store, id } = props;
  const maybeNode = store[id];

  return (
    <input
      type="text"
      placeholder={field.placeholder}
      value={maybeNode?.type === "string" ? maybeNode.value : ""}
      onChange={(ev) => {
        const value = ev.target.value;
        const maybeNode = value
          ? {
            type: "string",
            value,
          } satisfies EditString
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
