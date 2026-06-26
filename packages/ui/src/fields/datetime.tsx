"use client";

import type { JSX } from "react";
import type { DatetimeNode } from "@cosmos/core";
import type { DatetimeField } from "../type.ts";
import type { OnChange } from "./type.ts";

export interface DatatimeFieldProps {
  field: DatetimeField;
  node: DatetimeNode | null;
  onChange: OnChange;
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
            if (ev.target.value) {
              const value = new Date(ev.target.value);

              onChange({ type: "datetime", value });
            } else {
              onChange(null);
            }
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
