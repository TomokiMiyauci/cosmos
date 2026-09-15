"use client";

import type { JSX, SubmitEvent } from "react";
import type { Result } from "@miyauci/util";
import { type Definition, useFields } from "@cosmos/schema-field";
import type { SchemaValue } from "@cosmos/schema";

export interface EntryPageProps {
  definition: Definition;
  service: ContentService;
  formData: Content;
}

export default function EntryPage(
  props: EntryPageProps,
): JSX.Element {
  const { definition, service, formData } = props;

  const fields = useFields(definition, formData);

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const content = await fields.finalize();

    if (!content) return;

    const [_, errors] = await service.save(content);

    if (errors) {
      fields.setErrors(errors);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {fields.render()}

        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export type Content = SchemaValue;

export interface ContentService {
  save(content: Content): Promise<Result<void, ValidationError[]>>;
}

export interface ValidationError {
  path: string[];
  message: string;
}
