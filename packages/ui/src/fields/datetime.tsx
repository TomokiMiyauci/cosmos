"use client";

import type { JSX } from "react";
import type { DatetimeNode, Node } from "@cosmos/core";

export interface DatatimeFieldProps {
  node: DatetimeNode;
  onChange: (node: Node) => void;
}

export default function DatetimeField(props: DatatimeFieldProps): JSX.Element {
  const { node, onChange } = props;

  return (
    <input
      type="date"
      value={formatYYMMDD(node.value)}
      onChange={(ev) => {
        const value = new Date(ev.target.value);

        onChange({ ...node, value });
      }}
    />
  );
}

function formatYYMMDD(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}
