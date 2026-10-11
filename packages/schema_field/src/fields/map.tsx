import type { JSX } from "react";
import type { FieldProps } from "./type.ts";
import type { MapDefinition } from "../type.ts";
import { createUseList } from "./util.ts";

export default function MapField(
  props: FieldProps<MapDefinition>,
): JSX.Element {
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
      id={id}
    >
    </Layout>
  );
}
