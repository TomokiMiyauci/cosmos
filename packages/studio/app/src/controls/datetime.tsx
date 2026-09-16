"use client";
import type { JSX } from "react";
import type { ControlProps } from "@cosmos/schema-field";

export default function DatetimeControl(props: ControlProps): JSX.Element {
  const { required, id } = props;
  const [value, setValue] = props.api.useValue();

  return (
    <input
      id={id}
      type="datetime-local"
      value={value ?? ""}
      onChange={(ev) => {
        setValue(ev.target.value ?? null);
      }}
      required={required}
    />
  );
}
