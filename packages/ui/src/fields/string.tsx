/// <reference lib="dom" />

"use client";

import type { JSX } from "react";
import type {
  EditString,
  ErrorMap,
  OnChange,
  Store,
  StringFieldDefinition,
} from "./type.ts";

export interface StringFieldProps {
  field: StringFieldDefinition;
  onChange: OnChange;
  store: Store;
  id: string;
  errors: ErrorMap;
}

export default function StringField(props: StringFieldProps): JSX.Element {
  const { onChange, field, store, id, errors } = props;

  const maybeNode = store[id];
  const error = errors[id];

  return (
    <>
      <label>
        <p>{field.title}</p>
        <input
          type="text"
          value={maybeNode?.type === "string" ? maybeNode.value : ""}
          onChange={(ev) => {
            const value = ev.target.value;
            const maybeNode = value
              ? {
                type: "string",
                value,
              } satisfies EditString
              : null;

            const newStore = { ...store };

            if (maybeNode) {
              newStore[id] = maybeNode;
              onChange(newStore);
            } else {
              delete newStore[id];
              onChange(newStore);
            }
          }}
        />
      </label>

      {error && <p>{error}</p>}
    </>
  );
}
