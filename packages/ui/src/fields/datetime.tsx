"use client";

import type { JSX } from "react";
import type { DatetimeField, DatetimeNode, Node } from "@cosmos/core";

export interface DatatimeFieldProps {
  field: DatetimeField;
  node: DatetimeNode | null;
  onChange: (node: Node) => void;
}

export default function DatetimeField(props: DatatimeFieldProps): JSX.Element {
  const { node, onChange } = props;

  return (
    <input
      type="date"
      onChange={(ev) => {
        const value = new Date(ev.target.value);

        onChange({ type: "datetime", value });
      }}
      value={node?.value ? formatYYMMDD(node.value) : ""}
    />
  );
}

function formatYYMMDD(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}
