import type { JSX } from "react";
import type { MapNode } from "@cosmos/core";
import type { MapField } from "../type.ts";
import type { OnChange, RenderField } from "./type.ts";

export interface MapFieldProps {
  render: RenderField;
  onChange: OnChange;
  field: MapField;
  node: MapNode | null;
}

export default function MapField(props: MapFieldProps): JSX.Element {
  const { render, field, onChange, node } = props;

  return (
    <>
      {field.title}
      <ul>
        {Object.entries(field.fields).map(([name, field]) => {
          const onChildChange: OnChange = (childNode) => {
            const value = childNode
              ? { ...node?.value, [name]: childNode }
              : { ...node?.value };

            if (!childNode) {
              delete value[name];
            }

            const changed: MapNode = {
              ...node,
              type: "map",
              value,
            };
            onChange(changed);
          };
          const childNode = node?.value[name] ?? null;

          return (
            <li key={name}>
              {render({ onChange: onChildChange, field, node: childNode })}
            </li>
          );
        })}
      </ul>
    </>
  );
}
