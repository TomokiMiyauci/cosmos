import type { JSX } from "react";
import type { FieldProps, PrimitiveFieldValue } from "./type.ts";
import { createUseList } from "./util.ts";
import { useController } from "react-hook-form";

export default function MapField(props: FieldProps): JSX.Element {
  const { name, definition: def, render, layout: Layout } = props;
  const useList = createUseList(name);
  const { fieldState: { error } } = useController({ name });

  const api = {
    useList,
    useValue(): [string | null, (value: string | null) => void] {
      const { field } = useController<PrimitiveFieldValue>({ name });
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
        <def.presentation.widget
          definition={def}
          render={(def, group) => (
            render({
              definition: def,
              name: `${name}.${group}`,
            })
          )}
          api={api}
        />
      }
      error={error?.message ?? null}
    >
    </Layout>
  );
}
