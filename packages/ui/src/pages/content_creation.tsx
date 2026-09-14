"use client";

import type { JSX, SubmitEvent } from "react";
import { type Definition, useFields } from "@cosmos/schema-field";
import type { Result } from "@miyauci/util";
import { Page, resolvePath } from "../router.ts";
import type { SchemaValue } from "@cosmos/schema";
import type { Messenger } from "../messenger.ts";

export interface ContentCreatePageProps {
  definition: Definition;
  service: ContentService;
  messenger: Messenger;
}

export type Content = SchemaValue;

export interface ContentService {
  create(content: Content): Promise<Result<string, ValidationError[]>>;
}

export interface ValidationError {
  path: string[];
  message: string;
}

export default function ContentCreationPage(
  props: ContentCreatePageProps,
): JSX.Element {
  const { definition, service, messenger } = props;

  const fields = useFields(definition);

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const data = await fields.finalize();

    if (!data) return;

    const [id, errors] = await service.create(data);

    if (errors) {
      fields.setErrors(errors);
    } else {
      location.href = resolvePath(Page.Entry, { id });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {fields.render()}

        <button type="submit">
          {messenger.message({ type: "action", action: "create" })}
        </button>
      </form>
    </div>
  );
}
