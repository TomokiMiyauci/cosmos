"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import Form from "../form.tsx";
import type { SummaryInput, Template } from "../type.ts";
import type { NodeCreateUseCase } from "~usecase/node";
import type { Store } from "../fields/type.ts";
import { toFieldDefinition } from "./util.ts";

export interface ContentCreatePageProps {
  template: Template;
  usecase: NodeCreateUseCase;
}

export default function ContentCreationPage(
  props: ContentCreatePageProps,
): JSX.Element {
  const { template, usecase } = props;
  const { node: init, field } = template;

  const { node, setState, summary, setSummary, handle } = useCreateNode({
    init,
    usecase,
  });

  const definition = toFieldDefinition(field);

  return (
    <div>
      <h1>Content</h1>

      <label>
        <p>Name</p>

        <input
          value={summary.name}
          onChange={(ev) => setSummary({ name: ev.target.value })}
        />
      </label>

      <Form
        store={node}
        update={handle}
        field={definition}
        onChange={setState}
        id=""
      />
    </div>
  );
}

interface UseCreateNodeProps {
  usecase: NodeCreateUseCase;
  init: Node | null;
}

function useCreateNode(props: UseCreateNodeProps) {
  const [node, setState] = useState<Store>({});
  const [summary, setSummary] = useState<SummaryInput>({ name: "" });

  async function handle(node: Node | null): Promise<void> {
    await props.usecase.execute(node, summary);
  }

  return { node, setState, summary, setSummary, handle };
}
