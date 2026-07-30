"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import Form from "../form.tsx";
import type { Field, SummaryInput, Template } from "../type.ts";
import type { NodeCreateUseCase } from "~usecase/node";
import { FieldDefinition, Store } from "../fields/type.ts";
import { mapValues } from "@std/collections/map-values";

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

  async function handle(): Promise<void> {
    await props.usecase.execute(node, summary);
  }

  return { node, setState, summary, setSummary, handle };
}

function toFieldDefinition(field: Field): FieldDefinition {
  switch (field.type) {
    case "string": {
      return {
        type: "string",
      };
    }
    case "number": {
      return {
        type: "number",
      };
    }
    case "map": {
      const properties = mapValues(field.fields, toFieldDefinition);

      return {
        type: "map",
        properties,
      };
    }
    case "list": {
      return {
        type: "list",
        item: toFieldDefinition(field.field),
      };
    }
    case "boolean":
    case "reference":
    case "datetime":
    case "asset":
    case "union": {
      return {
        type: "string",
      };
    }
  }
}
