"use client";

import { type JSX, useState } from "react";
import type { Node, UnionNode } from "@cosmos/core";
import type { Field, UnionField } from "../type.ts";

export interface UnionFieldProps {
  field: UnionField;
  node: UnionNode | null;
  render: (props: Props) => JSX.Element;
  onChange: (node: Node | null) => void;
}

interface Props {
  node: Node | null;
  onChange: (node: Node | null) => void;
  field: Field;
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
