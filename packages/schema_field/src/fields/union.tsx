import type { JSX } from "react";
import type { FieldProps } from "./type.ts";
import type { FieldValue } from "../type.ts";
import { createUseList } from "./util.ts";
import { useController } from "react-hook-form";

export default function UnionField(props: FieldProps): JSX.Element {
  const { name, definition: def, render, layout: Layout, required = true, id } =
    props;
  const useList = createUseList(name);
  const { fieldState: { error } } = useController({ name });

  const api = {
    useList,
    useValue(): [string | null, (value: string | null) => void] {
      const { field } = useController<FieldValue>({ name });
      const value = field.value ?? null;
      const v = value === null ? null : String(value);

      return [v, (value: string | null) => {
        const v = typeof value === "string" ? Boolean(value) : null;

        field.onChange(v);
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
