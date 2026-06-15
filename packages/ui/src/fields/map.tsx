import type { JSX } from "react";
import type { MapNode, Node } from "@cosmos/core";

export interface MapFieldProps {
  render(
    props: { node: Node; onChange: OnChange },
  ): JSX.Element;
  node: MapNode;
  onChange: OnChange;
}

interface OnChange {
  (node: Node): void;
}

export default function MapField(props: MapFieldProps): JSX.Element {
  const { render, node, onChange } = props;

  return (
    <ul>
      {Object.entries(node.value).map(([name, childNode]) => {
        const onC: OnChange = (childNode) => {
          const changed: MapNode = {
            ...node,
            value: {
              ...node.value,
              [name]: childNode,
            },
          };
          onChange(changed);
        };
        return (
          <li key={name}>
            <label>
              {name}

              <div>
                {render({ node: childNode, onChange: onC })}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
