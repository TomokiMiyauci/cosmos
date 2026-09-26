import type {
  DefinitionQuery,
  Entry,
  EntrySaveError,
  EntryService,
  EntrySummary,
  EntrySummaryQuery,
  Model,
  ModelQuery,
  SaveEntry,
} from "@cosmos/studio";
import {
  CheckboxControl,
  DateControl,
  DatetimeControl,
  ListControl,
  MapControl,
  NumericControl,
  SelectControl,
  TextControl,
} from "@cosmos/studio/control";
import { Result } from "@miyauci/util";
import type { Control, Definition, Presentation } from "@cosmos/schema-field";
import { fromNode, toNode } from "@cosmos/schema-node";
import { GraphQLClient } from "graphql-request";
import {
  CreateEntryDocument,
  DeleteEntryDocument,
  GetEntryDocument,
  GetModelDocument,
  GetModelsDocument,
  GetSchemaDocument,
  type GetSchemaQuery_schemas as SchemaResponse,
  GetSummaryEntryDocument,
  UpdateEntryDocument,
} from "./generated/types.ts";

export class GraphqlDefinitionQuery implements DefinitionQuery {
  #client: GraphQLClient;

  constructor(url: URL, private ui: UiSchemaMap) {
    this.#client = new GraphQLClient(url.href);
  }
  async findFor(modelId: string): Promise<Definition | null> {
    const { model, schemas: schemaResponses } = await this.#client.request(
      GetSchemaDocument,
      {
        modelId,
      },
    );

    if (!model) return null;

    const schemas = schemaResponses.reduce<Record<string, SchemaResponse>>(
      (acc, cur) => {
        return {
          ...acc,
          [cur.id]: cur,
        };
      },
      {},
    );

    const definition = response2Defintion(model.schema, schemas, this.ui);

    return definition;
  }
}

export class GraphqlEntrySummaryQuery implements EntrySummaryQuery {
  #client: GraphQLClient;
  constructor(url: URL) {
    this.#client = new GraphQLClient(url.href);
  }
  async listByModel(modelId: string): Promise<EntrySummary[]> {
    const { entries } = await this.#client.request(GetSummaryEntryDocument, {
      model: modelId,
    });

    return entries.map((entry) => ({
      id: entry.id,
      title: entry.title,
      updatedAt: Temporal.Instant.from(entry.updatedAt),
    }));
  }
}

export class GraphqlModelQuery implements ModelQuery {
  #client: GraphQLClient;
  constructor(url: URL) {
    this.#client = new GraphQLClient(url.href);
  }

  async findById(id: string): Promise<Model | null> {
    const { model } = await this.#client.request(GetModelDocument, { id });

    return model;
  }

  async list(): Promise<Model[]> {
    const { models } = await this.#client.request(GetModelsDocument);
    return models.map((value) => ({ id: value.id, title: value.id }));
  }
}

type UiSchemaMap = Record<string, UiSchema>;

interface UiSchema {
  control: Control;
  title?: string;
}

export class GraphqlEntryService implements EntryService {
  #client: GraphQLClient;
  constructor(url: URL) {
    this.#client = new GraphQLClient(url.href);
  }

  async save(entry: SaveEntry): Promise<Result<Entry["id"], EntrySaveError>> {
    if ("id" in entry) {
      const content = toNode(entry.content);

      const { updateEntry } = await this.#client.request(UpdateEntryDocument, {
        id: entry.id,
        modelId: entry.modelId,
        content,
      });

      switch (updateEntry.__typename) {
        case "UpdateEntrySuccess": {
          return Result.ok(updateEntry.id);
        }
        case "ValidationError": {
          const errors = updateEntry.violations.map((violation) => {
            return {
              path: violation.path,
              message: violation.reason,
            };
          });

          return Result.error({ type: "VALIDATION", errors });
        }
      }
    }

    const content = toNode(entry.content);

    const { createEntry } = await this.#client.request(CreateEntryDocument, {
      modelId: entry.modelId,
      content,
    });

    switch (createEntry.__typename) {
      case "CreateEntrySuccess": {
        return Result.ok(createEntry.id);
      }
      case "ValidationError": {
        const errors = createEntry.violations.map((violation) => {
          return {
            path: violation.path,
            message: violation.reason,
          };
        });

        return Result.error({ type: "VALIDATION", errors });
      }
    }
  }
  async findById(id: string): Promise<Entry | null> {
    const { entry } = await this.#client.request(GetEntryDocument, { id });

    if (!entry) return null;

    const content = fromNode(entry.content);

    return { id: entry.id, modelId: entry.model.id, content };
  }

  async delete(id: Entry["id"]): Promise<void> {
    await this.#client.request(DeleteEntryDocument, { id });
  }
}

function pointer2Path(pointer: string): string[] {
  pointer = pointer.startsWith("/contents")
    ? pointer.replace("/contents", "")
    : pointer;
  pointer = pointer.startsWith("/") ? pointer.slice(1) : pointer;

  return pointer.split("/");
}

function response2Defintion(
  response: SchemaResponse,
  schemas: Record<string, SchemaResponse>,
  presentations: UiSchemaMap,
): Definition {
  const resolved = new Map<string, Definition>();

  for (const schema of Object.values(schemas)) {
    const presentation = resolvePresentation(schema, presentations);

    resolved.set(schema.id, createDefinitionContainer(schema, presentation));
  }

  for (const schema of Object.values(schemas)) {
    resolveSchema(schema);
  }

  return resolveSchema(response);

  function resolveSchema(response: SchemaResponse): Definition {
    const schema = resolved.get(response.id);

    if (!schema) throw new Error();

    switch (response.__typename) {
      case "StringSchema":
      case "NumberSchema":
      case "BooleanSchema":
        return schema;

      case "UnionSchema": {
        if (schema.type !== "union") throw new Error();

        schema.members = response.schemas.map(getSchema);

        return schema;
      }

      case "SequenseSchema": {
        if (schema.type !== "sequence") throw new Error();

        schema.item = getSchema(response.item);

        return schema;
      }

      case "MapSchema": {
        if (schema.type !== "map") throw new Error();

        const properties = Object.fromEntries(
          response.properties.map((property) => {
            return [property.key, getSchema(property.value)] as [
              string,
              Definition,
            ];
          }),
        );

        schema.properties = properties;

        return schema;
      }

      case "ReferenceSchema": {
        return schema;
      }
    }
  }

  function getSchema(id: string): Definition {
    const response = schemas[id];

    if (!response) throw new Error();

    return resolved.get(id) ?? resolveSchema(response);
  }
}

function resolvePresentation(
  response: SchemaResponse,
  map: UiSchemaMap,
): Presentation {
  const uiSchema = map[response.id];

  if (uiSchema) return { title: response.id, ...uiSchema };

  const title = response.id;

  switch (response.__typename) {
    case "StringSchema": {
      if (response.term) {
        switch (response.term) {
          case "DATE": {
            return { title, control: DateControl };
          }
          case "DATETIME": {
            return { title, control: DatetimeControl };
          }
        }
      }
      return { title, control: TextControl };
    }
    case "NumberSchema": {
      return { title, control: NumericControl };
    }
    case "BooleanSchema": {
      return { title, control: CheckboxControl };
    }

    case "ReferenceSchema": {
      return { title, control: SelectControl };
    }
    case "MapSchema": {
      return { title, control: MapControl };
    }
    case "SequenseSchema": {
      return { title, control: ListControl };
    }
    case "UnionSchema": {
      return { title, control: TextControl };
    }
  }
}

function createDefinitionContainer(
  response: SchemaResponse,
  presentation: Presentation,
): Definition {
  switch (response.__typename) {
    case "StringSchema": {
      const term = response.term === "DATE"
        ? "date"
        : response.term === "DATETIME"
        ? "datetime"
        : null;

      return {
        type: "string",
        term,
        presentation,
      };
    }

    case "NumberSchema":
      return {
        type: "number",
        presentation,
      };

    case "BooleanSchema":
      return { type: "boolean", presentation };

    case "UnionSchema":
      return {
        type: "union",
        members: [],
        presentation,
      };

    case "SequenseSchema":
      return {
        type: "sequence",
        // deno-lint-ignore no-non-null-assertion
        item: undefined!,
        presentation,
      };

    case "MapSchema": {
      return {
        type: "map",
        properties: {},
        required: response.required,
        presentation,
      };
    }

    case "ReferenceSchema": {
      return {
        type: "reference",
        presentation,
        allows: [], // TODO
      };
    }
  }
}
