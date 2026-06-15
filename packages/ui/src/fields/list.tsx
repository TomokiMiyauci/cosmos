import type { JSX } from "react";
import type { ListNode, Node } from "@cosmos/core";

export interface ListFieldProps {
  node: ListNode;
  render(
    props: { node: Node; onChange: OnChange },
  ): JSX.Element;
  onChange: OnChange;
}

interface OnChange {
  (node: Node): void;
}

export default function ListField(props: ListFieldProps): JSX.Element {
  const { node, render, onChange } = props;

  return (
    <ul>
      {node.value.map((childNode, name) => {
        const onC: OnChange = (childNode) => {
          const changed = {
            ...node,
            value: node.value.with(name, childNode),
          } satisfies ListNode;

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
