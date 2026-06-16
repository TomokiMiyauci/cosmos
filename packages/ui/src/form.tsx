"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import Field from "./fields/field.tsx";

export default function Form(
  props: { init: Node; update: (node: Node) => Promise<Node | null> },
): JSX.Element {
  const { init, update } = props;
  const [node, setState] = useState(init);

  return (
    <form
      onSubmit={async (ev) => {
        ev.preventDefault();

        const updated = await update(node);

        if (updated) {
          setState(updated);
        }
      }}
    >
      <Field node={node} onChange={setState}></Field>

      <button type="submit">Save</button>

      {JSON.stringify(node)}
    </form>
  );
}
