"use client";

import { type JSX, useState } from "react";
import type { UnionNode } from "@cosmos/core";
import type { UnionField } from "../type.ts";
import type { OnChange, RenderField } from "./type.ts";

export interface UnionFieldProps {
  field: UnionField;
  node: UnionNode | null;
  render: RenderField;
  onChange: OnChange;
}

export default function UnionField(props: UnionFieldProps): JSX.Element {
  const { field, node, render, onChange } = props;

  const [selected, setSelected] = useState(node?.key ?? "");

  const maybeField = field.variants[selected];

  return (
    <div>
      <label>
        {field.title}
      </label>
      <div>
        {Object.entries(field.variants).map(([name]) => {
          return (
            <label key={name}>
              <input
                type="radio"
                checked={selected === name}
                value={name}
                onChange={(ev) => {
                  setSelected(ev.target.value);
                }}
              />
              {name}
            </label>
          );
        })}
      </div>

      {maybeField &&
        render({
          field: maybeField,
          node: node?.value ?? null,
          onChange: (node) => {
            if (node) {
              onChange({
                type: "union",
                key: selected,
                value: node,
              });
            } else {
              onChange(node);
            }
          },
        })}
    </div>
  );
}
