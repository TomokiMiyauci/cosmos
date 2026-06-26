/// <reference lib="dom" />

"use client";

import type { JSX } from "react";
import type { StringNode } from "@cosmos/core";
import type { StringField } from "../type.ts";
import type { OnChange } from "./type.ts";

export interface StringFieldProps {
  field: StringField;
  node: StringNode | null;
  onChange: OnChange;
}

export default function StringField(props: StringFieldProps): JSX.Element {
  const { onChange, node, field } = props;

  return (
    <label>
      {field.title}

      <p>{field.description}</p>
      <input
        type="text"
        value={node?.value ?? ""}
        onChange={(ev) => {
          const value = ev.target.value;

          if (value) {
            onChange({ type: "string", value });
          } else {
            onChange(null);
          }
        }}
        required={field.required}
      />
    </label>
  );
}
