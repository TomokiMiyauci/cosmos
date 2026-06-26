"use client";

import type { JSX } from "react";
import type { ReferenceField } from "../type.ts";
import type { ReferenceNode } from "@cosmos/core";
import type { OnChange } from "./type.ts";

export interface ReferenceFieldProps {
  field: ReferenceField;
  node: ReferenceNode | null;
  onChange: OnChange;
}

export default function ReferenceField(
  props: ReferenceFieldProps,
): JSX.Element {
  const { field, node, onChange } = props;

  return (
    <label>
      {field.title}

      <p>{field.description}</p>

      <select
        onChange={(ev) => {
          const value = ev.target.value;

          if (value) {
            onChange({ type: "reference", value });
          } else {
            onChange(null);
          }
        }}
        value={node?.value ?? ""}
      >
        <option></option>
        {field.candidates.map((candidate) => {
          return <option key={candidate} value={candidate}>{candidate}</option>;
        })}
      </select>
    </label>
  );
}
