"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import FieldComponent from "./fields/field.tsx";
import type { Field } from "./type.ts";

export default function Form(
  props: {
    init: Node | null;
    update: (node: Node | null) => Promise<boolean>;
    field: Field;
  },
): JSX.Element {
  const { init, update, field } = props;
  const [node, setState] = useState(init);

  return (
    <form
      action={async () => {
        await update(node);
      }}
    >
      <FieldComponent node={node} onChange={setState} field={field} />

      <button type="submit">Save</button>

      {JSON.stringify(node)}
    </form>
  );
}
