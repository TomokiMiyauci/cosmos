"use client";

import type { JSX } from "react";
import type { BooleanNode } from "@cosmos/core";
import type { BooleanField } from "../type.ts";
import type { OnChange } from "./type.ts";

export interface BooleanFieldProps {
  field: BooleanField;
  node: BooleanNode | null;
  onChange: OnChange;
}

export default function BooleanField(
  props: BooleanFieldProps,
): JSX.Element {
  const { node, onChange, field } = props;

  return (
    <label>
      {field.title}

      <p>{field.description}</p>

      <input
        type="checkbox"
        onChange={(ev) => {
          const value = ev.target.checked;

          onChange({ type: "boolean", value });
        }}
        checked={node?.value ?? false}
      />
    </label>
  );
}
