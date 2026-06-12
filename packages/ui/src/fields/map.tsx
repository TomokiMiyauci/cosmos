import type { Field, MapField, Node } from "@cosmos/core";
import type { JSX } from "react";

export interface MapFieldProps {
  field: MapField;
  render(field: Field, node: Node | undefined): JSX.Element;
  node: Node;
}

export default function MapField(props: MapFieldProps): JSX.Element {
  const { field, render, node } = props;

  if (node.type !== "map") throw new Error();

  return (
    <ul>
      {Object.entries(field.fields).map(([key, field]) => {
        const value = node.value[key];

        return (
          <li key={key}>
            <label>{key} {render(field, value)}</label>
          </li>
        );
      })}
    </ul>
  );
}
