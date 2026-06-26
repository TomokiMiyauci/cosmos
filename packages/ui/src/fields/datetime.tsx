"use client";

import type { JSX } from "react";
import type { DatetimeNode, Node } from "@cosmos/core";
import type { DatetimeField } from "../type.ts";

export interface DatatimeFieldProps {
  field: DatetimeField;
  node: DatetimeNode | null;
  onChange: (node: Node) => void;
}

export default function DatetimeField(props: DatatimeFieldProps): JSX.Element {
  const { node, onChange, field } = props;

  return (
    <>
      <label>
        {field.title}

        <p>{field.description}</p>
        <input
          type="date"
          onChange={(ev) => {
            const value = new Date(ev.target.value);

            onChange({ type: "datetime", value });
          }}
          value={node?.value ? formatYYMMDD(node.value) : ""}
        />
      </label>
    </>
  );
}

function formatYYMMDD(date: Date): string {
  return date.toLocaleDateString("sv-SE");
}
