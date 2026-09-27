"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";
import { Select } from "~component";

export default function SelectControl(props: ControlProps): JSX.Element {
  const { api, required, id, definition } = props;
  const condidates = definition.type === "reference" ? definition.allows : [];
  const [value, onChange] = api.useValue();

  return (
    <Select
      id={id}
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value || null);
      }}
      required={required}
    >
      <option></option>
      {condidates.map((condidate) => {
        return <option key={condidate}>{condidate}</option>;
      })}
    </Select>
  );
}
