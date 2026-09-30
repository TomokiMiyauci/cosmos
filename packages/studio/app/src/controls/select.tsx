"use client";
import { type JSX, Suspense, type Usable, use } from "react";
import { type ControlProps, useField } from "@cosmos/schema-field";
import { Select } from "~component";
import { type EntrySummary, useQuerirs } from "~hook";

export default function SelectControl(props: ControlProps): JSX.Element {
  const { entrySummary } = useQuerirs();
  const promise = entrySummary.listByModel("posts");

  return (
    <Suspense fallback={<Select />}>
      <Use value={promise}>
        {(value) => {
          return <SelectView {...props} entries={value} />;
        }}
      </Use>
    </Suspense>
  );
}

function Use<T>(
  props: { value: Usable<T>; children: (value: T) => JSX.Element },
): JSX.Element {
  const used = use(props.value);

  return props.children(used);
}

function SelectView(
  props: { entries: EntrySummary[]; required: boolean } & ControlProps,
): JSX.Element {
  const { required, api, entries } = props;
  const { id, error, description, label } = useField();
  const [value, onChange] = api.useValue();

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
