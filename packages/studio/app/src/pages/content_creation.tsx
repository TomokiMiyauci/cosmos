"use client";

import { type JSX, type SubmitEvent, useId } from "react";
import { type Definition, useFields } from "@cosmos/schema-field";
import type { Result } from "@miyauci/util";
import { Page, router } from "~router";
import type { SchemaValue } from "@cosmos/schema";
import type { Messenger } from "../messenger.ts";
import { Button, FieldLayout } from "~component";

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
  const id = useId();

  async function handleSubmit(e: SubmitEvent): Promise<void> {
    e.preventDefault();
    const data = await fields.finalize();

    if (!data) return;

    const [id, errors] = await service.create(data);

    if (errors) {
      fields.setErrors(errors);
    } else {
      location.href = router.resolve(Page.Entry, { id });
    }
  }

  return (
    <div>
      <div
        style={{
          top: "0",
          position: "sticky",
          padding: "8px",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <a></a>

        <Button form={id} type="submit">
          {messenger.message({ type: "action", action: "create" })}
        </Button>
      </div>

      <form id={id} onSubmit={handleSubmit}>
        {fields.render({ layout: FieldLayout })}
      </form>
    </div>
  );
}
