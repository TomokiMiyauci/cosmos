import { type JSX, useState } from "react";
import type { FieldProps } from "./type.ts";
import type { FieldValue } from "../type.ts";
import { createUseList } from "./util.ts";
import { useController, useFormContext } from "react-hook-form";

export default function NumberField(props: FieldProps): JSX.Element {
  const { name, definition: def, render, layout: Layout, required = true, id } =
    props;
  const useList = createUseList(name);
  const { fieldState: { error }, field: { value = null, onChange } } =
    useController<FieldValue>({ name });
  const form = useFormContext();

  const [presentaion, setPresentation] = useState<string | null>(
    value === null ? null : String(value),
  );

  if (!(typeof value === "number" || value === null)) {
    // TODO
    throw new Error();
  }

  const api = {
    useList,
    useValue(): [string | null, (value: string | null) => void] {
      return [presentaion, (value: string | null) => {
        setPresentation(value);

        const v = typeof value === "string" ? Number(value) : null;

        if (typeof v === "number" && !Number.isFinite(v)) {
          form.setError(name, { message: "Invalid value" });
        } else {
          form.clearErrors(name);
          onChange(v);
        }
      }];
    },
  };

  return (
    <Layout
      title={def.presentation.title}
      control={
        <def.presentation.control
          definition={def}
          render={(def) => render({ name, definition: def })}
          api={api}
          required={required}
          id={id}
        />
      }
      error={error?.message ?? null}
      id={id}
    >
    </Layout>
  );
}
