/// <reference lib="dom" />

"use client";

import type { JSX } from "react";
import type { Node, StringNode } from "@cosmos/core";
import type { StringField } from "../type.ts";

export interface StringFieldProps {
  field: StringField;
  node: StringNode | null;
  onChange: (node: Node) => void;
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
          onChange({ type: "string", value: ev.target.value });
        }}
        required={field.required}
      />
    </label>
  );
}
