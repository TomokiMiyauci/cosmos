"use client";
import { type JSX, Suspense } from "react";
import { type ControlProps, useField, useValue } from "@cosmos/schema-field";
import { Select, Use } from "~component";
import { type EntrySummary, useQuerirs } from "~hook";

export default function SelectControl(props: ControlProps): JSX.Element {
  const { entrySummary } = useQuerirs();
  const promise = entrySummary.listByModel("posts");

  return (
    <Suspense
      fallback={
        <Select>
          <option>...</option>
        </Select>
      }
    >
      <Use value={promise}>
        {(value) => <SelectView {...props} entries={value} />}
      </Use>
    </Suspense>
  );
}

function SelectView(
  props: { entries: EntrySummary[] } & ControlProps,
): JSX.Element {
  const { required, entries } = props;
  const { id, error, description, label } = useField();
  const [value, onChange] = useValue();

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
      <option />
      {entries.map((entry) => {
        return <option key={entry.id} value={entry.id}>{entry.id}</option>;
      })}
    </Select>
  );
}
