"use client";

import type { JSX, SubmitEvent } from "react";
import { type Definition, Fields, useFields } from "@cosmos/schema-field";
import type { Result } from "@miyauci/util";
import { Page, resolvePath } from "../router.ts";
import { Parser, type Value } from "@cosmos/validator";
import { HtmlIoInterpreter } from "./a.ts";

const parser = new Parser(new HtmlIoInterpreter());

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

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const content = fields.getValues();

    if (!content) return;

    const [data, error] = parser.parse(content, definition);

    if (error) {
      const errors = error.map((e) => ({ message: e.reason, path: e.path }));

      fields.setErrors(errors);
      return;
    }

    const [id, errors] = await service.create(data);

    if (errors) {
      fields.setErrors(errors);
    } else {
      location.href = resolvePath(Page.Content, { id });
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Fields definition={definition} form={fields.form} />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
