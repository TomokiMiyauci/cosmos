import type { JSX } from "react";
import type { MapNode, Node } from "@cosmos/client";

export interface MapFieldProps {
  render(node: Node): JSX.Element;
  node: MapNode;
}

export default function MapField(props: MapFieldProps): JSX.Element {
  const { render, node } = props;

  return (
    <ul>
      {Object.entries(node.fields).map(([key, field]) => {
        return (
          <li key={key}>
            <label>
              {key}

              <div>
                {render(field)}
              </div>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
