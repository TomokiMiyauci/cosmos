import type { JSX } from "react";
import type { FieldProps, PrimitiveFieldValue } from "./type.ts";
import { createUseList } from "./util.ts";
import { useController } from "react-hook-form";

export default function NumberField(props: FieldProps): JSX.Element {
  const { name, definition: def, render, layout: Layout, required = true } =
    props;
  const useList = createUseList(name);
  const { fieldState: { error } } = useController({ name });

  const api = {
    useList,
    useValue(): [string | null, (value: string | null) => void] {
      const { field } = useController<PrimitiveFieldValue>({ name });
      const value = field.value ?? null;

      if (!(value === null || typeof value === "number")) {
        throw new Error();
      }

      const v = typeof value === "number" ? value.toString() : value;

      return [v, (value: string | null) => {
        const v = typeof value === "string" ? Number(value) : null;

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
        />
      }
      error={error?.message ?? null}
    >
    </Layout>
  );
}
