"use client";

import type { JSX } from "react";
import type { NumberNode } from "@cosmos/core";
import type { NumberField } from "../type.ts";
import type { OnChange } from "./type.ts";

export interface NumberFieldProps {
  field: NumberField;
  node: NumberNode | null;
  onChange: OnChange;
}

export default function NumberField(props: NumberFieldProps): JSX.Element {
  const { onChange, node, field } = props;

  return (
    <label>
      {field.title}

      <p>{field.description}</p>
      <input
        type="number"
        onChange={(ev) => {
          const value = Number(ev.target.value);

          if (Number.isNaN(value)) {
            onChange(null);
          } else {
            onChange({ type: "number", value });
          }
        }}
        value={node?.value ?? ""}
      />
    </label>
  );
}
