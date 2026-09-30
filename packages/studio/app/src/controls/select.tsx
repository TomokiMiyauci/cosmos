"use client";
import type { JSX } from "react";
import { type ControlProps, useField } from "@cosmos/schema-field";
import { Select } from "~component";

export default function SelectControl(props: ControlProps): JSX.Element {
  const { api, required, definition } = props;
  const condidates = definition.type === "reference" ? definition.allows : [];
  const [value, onChange] = api.useValue();
  const { id, error, description, label } = useField();

  return (
    <Select
      id={id}
      value={value ?? ""}
      onChange={(ev) => {
        onChange(ev.target.value || null);
      }}
      required={required}
      aria-errormessage={error.id}
      aria-describedby={description.id}
      aria-labelledby={label.id}
    >
      <option></option>
      {condidates.map((condidate) => {
        return <option key={condidate}>{condidate}</option>;
      })}
    </Select>
  );
}
