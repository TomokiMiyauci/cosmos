import type { JSX } from "react";
import type { Field, ListField, Node } from "@cosmos/core";

export interface ListFieldProps {
  render(
    props: { field: Field; onChange: OnChange },
  ): JSX.Element;
  onChange: OnChange;
  field: ListField;
}

interface OnChange {
  (node: Node): void;
}

export default function ListField(props: ListFieldProps): JSX.Element {
  const { render, onChange, field } = props;

  function onC(node: Node) {
    onChange({
      type: "list",
      value: [node],
    });
  }

  return (
    <div>
      {render({ field: field.field, onChange: onC })}
    </div>
  );
}
