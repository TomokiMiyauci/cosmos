import type { JSX } from "react";
import type { FieldProps } from "./type.ts";
import { createUseList } from "./util.ts";

export default function UnionField(props: FieldProps): JSX.Element {
  const { name, definition: def, render, layout: Layout, required = true, id } =
    props;
  const useList = createUseList(name);

  const api = {
    useList,
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
      id={id}
    >
    </Layout>
  );
}
