import type { JSX } from "react";
import type { FieldProps, PrimitiveFieldValue } from "./type.ts";
import type { MapDefinition } from "../type.ts";
import { createUseList } from "./util.ts";
import { useController } from "react-hook-form";

export default function MapField(
  props: FieldProps<MapDefinition>,
): JSX.Element {
  const { name, definition: def, render, layout: Layout, required = true } =
    props;
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
        <def.presentation.control
          definition={def}
          render={(def, group) => {
            if (typeof group === "string") {
              const isRequired = props.definition.required.includes(group);

              return render({
                definition: def,
                name: `${name}.${group}`,
                required: isRequired,
              });
            }

            return render({ definition: def, name });
          }}
          api={api}
          required={required}
        />
      }
      error={error?.message ?? null}
    >
    </Layout>
  );
}
