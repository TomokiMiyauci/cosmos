import type { JSX } from "react";
import type { Node } from "@cosmos/core";
import FieldComponent from "./fields/field.tsx";
import type { Field } from "./type.ts";
import type { OnChange } from "./fields/type.ts";

export interface FormProps {
  node: Node | null;
  update: (node: Node | null) => Promise<void>;
  field: Field;
  onChange: OnChange;
}

export default function Form(props: FormProps): JSX.Element {
  const { node, update, field, onChange } = props;

  return (
    <form
      action={async () => {
        "use server";
        await update(node);
      }}
    >
      <FieldComponent node={node} onChange={onChange} field={field} />

      <button type="submit">Save</button>

      {JSON.stringify(node)}
    </form>
  );
}
