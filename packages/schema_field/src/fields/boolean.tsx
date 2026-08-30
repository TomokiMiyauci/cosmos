import type { JSX } from "react";
import type { FieldProps, Primitive, PrimitiveFieldValue } from "./type.ts";
import { createUseList } from "./util.ts";
import { useController } from "react-hook-form";

export default function BooleanField(props: FieldProps): JSX.Element {
  const { name, definition: def, render } = props;
  const useList = createUseList(name);

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
    <label>
      <p>{def.presentation.title}</p>

      <def.presentation.widget
        definition={def}
        render={(def) => render({ name, definition: def })}
        api={api}
      />
    </label>
  );
}
