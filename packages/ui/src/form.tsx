"use client";

import { type JSX, useState } from "react";
import type { Field as F, Node } from "@cosmos/core";
import Field from "./fields/field.tsx";

export default function Form(
  props: {
    init: Node | null;
    update: (node: Node | null) => Promise<boolean>;
    field: F;
  },
): JSX.Element {
  const { init, update, field } = props;
  const [node, setState] = useState(init);

  return (
    <form
      onSubmit={async (ev) => {
        ev.preventDefault();

        await update(node);
      }}
    >
      <Field node={node} onChange={setState} field={field} />

      <button type="submit">Save</button>

      {JSON.stringify(node)}
    </form>
  );
}
