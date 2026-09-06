import type { JSX } from "react";
import type { FieldProps, Primitive, PrimitiveFieldValue } from "./type.ts";
import { createUseList } from "./util.ts";
import { useController } from "react-hook-form";

export default function BooleanField(props: FieldProps): JSX.Element {
  const { name, definition: def, render, layout: Layout } = props;
  const useList = createUseList(name);
  const { fieldState: { error } } = useController({ name });

  const api = {
    useList,
    useValue(): [string | null, (value: string | null) => void] {
      const { field } = useController<PrimitiveFieldValue>({ name });
      const value = field.value ?? null;

      if (!(value === null || typeof value === "boolean")) {
        throw new Error();
      }

      const v: string | null = typeof value === "boolean"
        ? value.toString()
        : value;

      return [v, (value: Primitive | null) => {
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
          required
        />
      }
      error={error?.message ?? null}
    >
    </Layout>
  );
}
