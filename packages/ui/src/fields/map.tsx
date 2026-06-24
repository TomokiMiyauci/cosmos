import type { JSX } from "react";
import type { MapNode, Node } from "@cosmos/core";
import type { Field, MapField } from "../type.ts";

export interface MapFieldProps {
  render(
    props: { field: Field; onChange: OnChange; node: Node | null },
  ): JSX.Element;
  onChange: OnChange;
  field: MapField;
  node: MapNode | null;
}

interface OnChange {
  (node: Node): void;
}

export default function MapField(props: MapFieldProps): JSX.Element {
  const { render, field, onChange, node } = props;

  return (
    <ul>
      {Object.entries(field.fields).map(([name, field]) => {
        const onC: OnChange = (childNode) => {
          const changed: MapNode = {
            type: "map",
            value: {
              ...node?.value,
              [name]: childNode,
            },
          };
          onChange(changed);
        };
        const childNode = node?.value[name] ?? null;

        return (
          <li key={name}>
            <label>
              {name}

              <div>
                {render({ onChange: onC, field, node: childNode })}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
