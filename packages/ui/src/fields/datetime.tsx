"use client";

import type { JSX } from "react";
import type { DatetimeFieldDefinition, OnChange, Store } from "./type.ts";

export interface DatatimeFieldProps {
  field: DatetimeFieldDefinition;
  onChange: OnChange;
  error?: string;
  store: Store;
  id: string;
}

export default function DatetimeField(props: DatatimeFieldProps): JSX.Element {
  const { onChange, store, id, field } = props;
  const maybeNode = store[id];
  const currentValue = maybeNode?.type === "datetime"
    ? formatYYMMDD(maybeNode.value)
    : "";

  return (
    <>
      <label>
        <p>{field.title}</p>

        <input
          type="date"
          onChange={(ev) => {
            const value = new Date(ev.target.value);
            const nextStore = {
              ...store,
              [id]: { type: "datetime" as const, value },
            };

            onChange(nextStore);
          }}
          value={currentValue}
        />
      </label>
    </>
  );
}

function formatYYMMDD(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}
