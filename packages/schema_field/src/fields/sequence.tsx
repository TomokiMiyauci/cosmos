import type { JSX } from "react";
import type { FieldProps } from "./type.ts";

export default function SequenceField(props: FieldProps): JSX.Element {
  const { name, definition: def, render, layout: Layout, required = true, id } =
    props;

  return (
    <Layout
      title={def.presentation.title}
      control={
        <def.presentation.control
          definition={def}
          render={(def, group) => (
            render({ name: `${name}[${group}]`, definition: def })
          )}
          required={required}
        />
      }
      id={id}
    >
    </Layout>
  );
}
