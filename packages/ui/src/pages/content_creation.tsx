"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import Form from "../form.tsx";
import type { Summary, Template } from "../type.ts";
import type { NodeCreateUseCase } from "~usecase/node";

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

  return (
    <div>
      <h1>Content</h1>

      <label>
        Name

        <input
          value={summary.name}
          onChange={(ev) => setSummary({ name: ev.target.value })}
        />
      </label>

      <Form node={node} update={handle} field={field} onChange={setState} />
    </div>
  );
}

interface UseCreateNodeProps {
  usecase: NodeCreateUseCase;
  init: Node | null;
}

function useCreateNode(props: UseCreateNodeProps) {
  const [node, setState] = useState(props.init);
  const [summary, setSummary] = useState<Summary>({ name: "" });

  async function handle(): Promise<void> {
    await props.usecase.execute(node, summary);
  }

  return { node, setState, summary, setSummary, handle };
}
