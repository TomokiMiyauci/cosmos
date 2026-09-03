"use client";

import type { JSX } from "react";
import type { Result } from "@miyauci/util";
import {
  type Definition,
  Fields,
  useFields,
  type Value,
} from "@cosmos/schema-field";

export interface EntryPageProps {
  definition: Definition;
  service: ContentService;
  formData: Content;
}

export default function EntryPage(
  props: EntryPageProps,
): JSX.Element {
  const { definition, service, formData } = props;

  const fields = useFields(formData);

  async function handleSubmit(): Promise<void> {
    const content = fields.getValues();

    if (!content) return;

    const [_, errors] = await service.save(content);

    if (errors) {
      for (const error of errors) {
        fields.setError({ path: error.path, message: error.message });
      }
    }
  }

  return (
    <div>
      <form action={handleSubmit}>
        <Fields definition={definition} form={fields.form} />

        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export type Content = Value;

export interface ContentService {
  save(content: Content): Promise<Result<void, ValidationError[]>>;
}

export interface ValidationError {
  path: string[];
  message: string;
}
