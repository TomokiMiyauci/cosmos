"use client";

import type { JSX } from "react";
import {
  type Definition,
  Fields,
  useFields,
  type Value,
} from "@cosmos/schema-field";
import type { Result } from "@miyauci/util";

export interface ContentCreatePageProps {
  definition: Definition;
  service: ContentService;
}

type Content = Value;

export interface ContentService {
  create(content: Content): Promise<Result<void, ValidationError[]>>;
}

interface ValidationError {
  path: string[];
  message: string;
}

export default function ContentCreationPage(
  props: ContentCreatePageProps,
): JSX.Element {
  const { definition, service } = props;

  const fields = useFields();

  async function handleSubmit(): Promise<void> {
    const content = fields.getValues();

    if (!content) return;

    const [_, errors] = await service.create(content);

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

        <button type="submit">Create</button>
      </form>
    </div>
  );
}
