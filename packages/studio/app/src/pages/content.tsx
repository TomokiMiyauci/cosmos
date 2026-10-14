"use client";

import { type JSX, type SubmitEvent, useId } from "react";
import type { Result } from "@miyauci/util";
import { type Definition, useFields } from "@cosmos/schema-field";
import type { SchemaValue } from "@cosmos/schema";
import { Button, FieldLayout } from "~component";
import { Page, router } from "~router";

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
  const id = useId();

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
      <form
        style={{
          paddingLeft: "8px",
          paddingRight: "8px",
        }}
        id={id}
        onSubmit={handleSubmit}
      >
        {fields.render({ layout: FieldLayout })}
      </form>

      <div
        role="toolbar"
        style={{
          bottom: "0",
          position: "sticky",
          padding: "8px",
          backgroundColor: "white",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button form={id} type="submit">
          Update
        </Button>

        <Button
          type="button"
          onClick={async () => {
            const yes = confirm(`Delete entry?`);

            if (yes) {
              await service.delete();
              location.href = router.resolve(Page.Home, {});
            }
          }}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}

export type Content = SchemaValue;

export interface ContentService {
  save(content: Content): Promise<Result<void, ValidationError[]>>;
  delete(): Promise<void>;
}

export interface ValidationError {
  path: string[];
  message: string;
}
