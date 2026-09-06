"use client";

import type { JSX } from "react";
import {
  type Definition,
  Fields,
  useFields,
  type Value,
} from "@cosmos/schema-field";
import type { Result } from "@miyauci/util";
import { Page, resolvePath } from "../router.ts";

export interface ContentCreatePageProps {
  definition: Definition;
  service: ContentService;
}

export type Content = Value;

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
  const { definition, service } = props;

  const fields = useFields();

  async function handleSubmit(): Promise<void> {
    const content = fields.getValues();

    if (!content) return;

    const [id, errors] = await service.create(content);

    if (errors) {
      fields.setErrors(errors);
    } else {
      location.href = resolvePath(Page.Content, { id });
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
