"use client";

import type { JSX } from "react";
import type { DatetimeField, Node } from "@cosmos/core";

export interface DatatimeFieldProps {
  field: DatetimeField;
  onChange: (node: Node) => void;
}

export default function DatetimeField(props: DatatimeFieldProps): JSX.Element {
  const { field, onChange } = props;

  return (
    <input
      type="date"
      onChange={(ev) => {
        const value = new Date(ev.target.value);

        onChange({ type: "datetime", value });
      }}
    />
  );
}

function formatYYMMDD(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}
