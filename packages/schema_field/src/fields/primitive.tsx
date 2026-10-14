import type { JSX } from "react";
import type { FieldProps } from "./type.ts";

export default function PrimitiveField(props: FieldProps): JSX.Element {
  const {
    name,
    definition: def,
    render,
    layout: Layout,
    required = true,
    id,
  } = props;

  return (
    <Layout
      title={def.presentation.title}
      control={
        <def.presentation.control
          definition={def}
          render={(def) => render({ name, definition: def })}
          required={required}
        />
      }
      id={id}
    >
    </Layout>
  );
}
