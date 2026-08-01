"use client";

import type { JSX } from "react";
import type {
  ErrorMap,
  OnChange,
  Store,
  UnionFieldDefinition,
} from "./type.ts";
import Field from "./field.tsx";

export interface UnionFieldProps {
  field: UnionFieldDefinition;

  onChange: OnChange;
  store: Store;
  id: string;
  errors: ErrorMap;
}

export default function UnionField(props: UnionFieldProps): JSX.Element {
  const { field, onChange, store, id, errors } = props;

  const current = store[id];

  if (current && current.type !== "union") throw new Error();

  const childId = current?.value ?? null;
  const maybeField = typeof current?.key === "string"
    ? field.variants[current.key]
    : null;

  return (
    <fieldset>
      <legend>Union Field</legend>

      {Object.entries(field.variants).map(([name]) => {
        return (
          <label key={name}>
            <input
              type="radio"
              checked={current?.key === name}
              value={name}
              onChange={(ev) => {
                const selectedKey = ev.target.value;

                onChange((prev) => {
                  const nextStore = { ...prev };
                  const myNode = nextStore[id];

                  const nextChildId = myNode?.type === "union"
                    ? myNode.value
                    : crypto.randomUUID();

                  nextStore[id] = {
                    type: "union",
                    key: selectedKey,
                    value: nextChildId,
                  };

                  delete nextStore[nextChildId];

                  return nextStore;
                });
              }}
            />
            {name}
          </label>
        );
      })}

      {maybeField && childId && (
        <div>
          <Field
            definition={maybeField}
            changeStore={onChange}
            store={store}
            id={childId}
            errors={errors}
          />
        </div>
      )}
    </fieldset>
  );
}
