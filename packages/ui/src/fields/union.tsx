"use client";

import type { JSX } from "react";
import type { OnChange, Store, UnionFieldDefinition } from "./type.ts";
import Field from "./field.tsx";

export interface UnionFieldProps {
  field: UnionFieldDefinition;

  onChange: OnChange;
  store: Store;
  id: string;
}

export default function UnionField(props: UnionFieldProps): JSX.Element {
  const { field, onChange, store, id } = props;

  const current = store[id];

  if (current && current.type !== "union") throw new Error();

  const childId = current?.value ?? null;
  const maybeField = typeof current?.key === "string"
    ? field.variants[current.key]
    : null;

  return (
    <div>
      <fieldset>
        <legend>Select</legend>

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

                    const baseVariants = myNode?.type === "union"
                      ? { ...myNode.variants }
                      : Object.keys(field.variants).reduce<
                        Record<string, string>
                      >(
                        (acc, variantName) => {
                          acc[variantName] = crypto.randomUUID();
                          return acc;
                        },
                        {},
                      );

                    const nextChildId = baseVariants[selectedKey]!;

                    nextStore[id] = {
                      type: "union",
                      key: selectedKey,
                      value: nextChildId,
                      variants: baseVariants,
                    };

                    if (nextStore[nextChildId] === undefined) {
                      nextStore[nextChildId] = null;
                    }

                    return nextStore;
                  });
                }}
              />
              {name}
            </label>
          );
        })}
      </fieldset>

      {maybeField && childId && (
        <Field
          definition={maybeField}
          changeStore={(childFn) => {
            onChange((prev) => {
              const updatedStore = childFn(prev);

              if (current) {
                updatedStore[id] = current;
              }

              return updatedStore;
            });
          }}
          store={store}
          id={childId}
        />
      )}
    </div>
  );
}
