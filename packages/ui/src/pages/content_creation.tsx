"use client";

import { type JSX, useState } from "react";
import type { Node } from "@cosmos/core";
import Field from "../fields/field.tsx";
import type {
  CmsService,
  EntryInput,
  ErrorCode,
  SummaryInput,
  Template,
} from "../type.ts";
import type { NodeCreateUseCase } from "~usecase/node";
import type { ErrorMap, Store } from "../fields/type.ts";
import { toFieldDefinition, toNode } from "./util.ts";
import { mapValues } from "@std/collections/map-values";

export interface ContentCreatePageProps {
  template: Template;
  usecase: NodeCreateUseCase;
  service: CmsService;
}

export default function ContentCreationPage(
  props: ContentCreatePageProps,
): JSX.Element {
  const { template, usecase, service } = props;
  const { node: init, field } = template;

  const { node: store, setState, summary, setSummary } = useCreateNode({
    init,
    usecase,
  });

  const [errors, setErrorMap] = useState<ErrorMap>({});
  const [nameError, setNameError] = useState<string | null>(null);

  const id = "";

  const definition = toFieldDefinition(field);

  return (
    <div>
      <h1>Entry</h1>

      <form
        action={async () => {
          "use server";
          const idNode = toNode(store, id);

          if (idNode) {
            const entry = {
              name: summary.name,
              node: idNode,
              model: template.meta.model,
            } satisfies EntryInput;

            const [_, error] = await service.createEntry(entry);

            if (error) {
              if (error.name) {
                const key = code2I18nKey(error.name.code);
                const message = t(key);

                setNameError(message);
              }

              if (error.node) {
                const errorMap = mapValues(error.node, (detail) => {
                  const key = code2I18nKey(detail.code);

                  return t(key);
                });

                setErrorMap(errorMap);
              }
            }
          }
        }}
      >
        <label>
          <p>Name</p>

          <input
            value={summary.name}
            onChange={(ev) => setSummary({ name: ev.target.value })}
          />
          {nameError && <p>{nameError}</p>}
        </label>

        <p>Content</p>

        <Field
          store={store}
          definition={definition}
          changeStore={setState}
          errors={errors}
          id={id}
        />
        <button type="submit">Create</button>
      </form>
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

function code2I18nKey(code: ErrorCode): string {
  return code;
}

function t(key: string): string {
  return key;
}
