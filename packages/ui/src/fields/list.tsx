import type { JSX } from "react";
import type { Field, ListField, ListNode, Node } from "@cosmos/core";

export interface ListFieldProps {
  render(
    props: { field: Field; node: Node | null; onChange: OnChange },
  ): JSX.Element;
  onChange: OnChange;
  field: ListField;
  node: ListNode | null;
}

interface OnChange {
  (node: Node | null): void;
}

export default function ListField(props: ListFieldProps): JSX.Element {
  const { render, onChange, field, node } = props;

  const init = node?.value ?? [];
  const values = [...init, null] satisfies [...Node[], null];

  return (
    <div>
      <ul>
        {values.map((child, index) => {
          function onC(child: Node | null): void {
            const newValues = child
              ? init.toSpliced(index, 1, child)
              : init.toSpliced(index, 1);

            onChange({ type: "list", value: newValues });
          }

          return (
            <li key={index}>
              {render({ field: field.field, node: child, onChange: onC })}

              {child && (
                <button
                  type="button"
                  onClick={() => {
                    const newValues = init.toSpliced(index, 1);

                    onChange({ type: "list", value: newValues });
                  }}
                >
                  Delete
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
