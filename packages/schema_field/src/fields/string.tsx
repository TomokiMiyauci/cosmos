import type { JSX } from "react";
import type { FieldProps, PrimitiveFieldValue } from "./type.ts";
import { createUseList } from "./util.ts";
import { useController } from "react-hook-form";

export default function StringField(props: FieldProps): JSX.Element {
  const { name, definition: def, render } = props;

  const useList = createUseList(name);

  const api = {
    useList,
    useValue(): [string | null, (value: string | null) => void] {
      const { field } = useController<PrimitiveFieldValue>({ name });
      const value = field.value ?? null;

      const v: string | null = value === null ? null : String(value);

      return [v, (value: string | null) => {
        field.onChange(value);
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
