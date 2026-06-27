"use client";

import type { AssetNode } from "@cosmos/core";
import type { JSX } from "react";
import type { AssetField } from "../type.ts";
import type { OnChange } from "./type.ts";

export interface AssetFieldProps {
  field: AssetField;
  node: AssetNode | null;
  onChange: OnChange;
}

export default function AssetField(
  props: AssetFieldProps,
): JSX.Element {
  const { node, field, onChange } = props;

  return (
    <div>
      <p>{field.title}</p>

      <select
        onChange={(ev) => {
          const value = ev.target.value;

          if (value) {
            onChange({ type: "asset", value });
          } else {
            onChange(null);
          }
        }}
        value={node?.value ?? ""}
      >
        <option></option>
        {field.candidates.map((value) => {
          return <option key={value} value={value}>{value}</option>;
        })}
      </select>
    </div>
  );
}
