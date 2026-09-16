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
  TextControl,
} from "@cosmos/studio/control";
import { Result } from "@miyauci/util";
import { Client, type SchemaResponse } from "@cosmos/content-openapi/client";
import type { Control, Definition, Presentation } from "@cosmos/schema-field";
import { mapValues } from "@std/collections/map-values";
import { fromNode, toNode } from "@cosmos/schema-node";

export class OpenapiDefinitionQuery implements DefinitionQuery {
  #client: Client;

  constructor(url: URL, private ui: UiSchemaMap) {
    this.#client = new Client(url);
  }
  async findFor(modelId: string): Promise<Definition | null> {
    const modelResponse = await this.#client.getModel({
      path: { id: modelId },
    });

    if (modelResponse.status === 404) return null;

    const response = await this.#client.getSchema(
      { path: { id: modelResponse.body.schema.id } },
    );

    if (response.status === 404) return null;

    const schemaResponses = await this.#client.getSchemas();

    const schemas = schemaResponses.body.reduce<Record<string, SchemaResponse>>(
      (acc, cur) => {
        return {
          ...acc,
          [cur.id]: cur,
        };
      },
      {},
    );

    const definition = response2Defintion(response.body, schemas, this.ui);

    return definition;
  }
}

export class OpenapiEntrySummaryQuery implements EntrySummaryQuery {
  #client: Client;
  constructor(url: URL) {
    this.#client = new Client(url);
  }
  async listByModel(modelId: string): Promise<EntrySummary[]> {
    const responses = await this.#client.getEntrySummaries({
      query: { model: modelId },
    });

    return responses.body.map((response) => ({
      id: response.id,
      title: response.id,
    }));
  }
}

export class OpenapiModelQuery implements ModelQuery {
  #client: Client;
  constructor(url: URL) {
    this.#client = new Client(url);
  }

  async list(): Promise<Model[]> {
    const modelsResponse = await this.#client.getModels();

    return modelsResponse.body.map((response) => ({
      id: response.id,
      title: response.id,
    }));
  }
}

type UiSchemaMap = Record<string, UiSchema>;

interface UiSchema {
  control: Control;
  title?: string;
}

export class OpenapiEntryService implements EntryService {
  #client: Client;
  constructor(url: URL) {
    this.#client = new Client(url);
  }

  async save(entry: SaveEntry): Promise<Result<Entry["id"], EntrySaveError>> {
    if ("id" in entry) {
      const contents = toNode(entry.content);
      const response = await this.#client.putEntry({
        body: { contents, model: entry.modelId },
        path: { id: entry.id },
      });

      switch (response.status) {
        case 400:
        case 409: {
          throw new Error();
        }
        case 422: {
          const errors = response.body.errors.map((failure) => {
            const path = pointer2Path(failure.pointer);

            return {
              path,
              message: failure.detail,
            };
          });

          return Result.error({ type: "VALIDATION", errors });
        }
        case 204: {
          return Result.ok(entry.id);
        }
      }
    }

    const contents = toNode(entry.content);
    const response = await this.#client.postEntry({
      body: { model: entry.modelId, contents },
    });

    switch (response.status) {
      case 201: {
        return Result.ok(response.body.id);
      }
      case 400: {
        throw new Error();
      }
      case 409: {
        throw new Error();
      }
      case 422: {
        const errors = response.body.errors.map((failure) => {
          const path = pointer2Path(failure.pointer);

          return {
            path,
            message: failure.detail,
          };
        });

        return Result.error({ type: "VALIDATION", errors });
      }
    }
  }
  async findById(id: string): Promise<Entry | null> {
    const response = await this.#client.getEntry({ path: { id } });

    if (response.status === 404) return null;

    const data = response.body;

    const content = fromNode(data.contents);

    return { id: data.id, modelId: data.model.id, content };
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

    switch (response.type) {
      case "string":
      case "number":
      case "boolean":
        return schema;

      case "union": {
        if (schema.type !== "union") throw new Error();

        schema.members = response.schemas.map(({ id }) => {
          return getSchema(id);
        });

        return schema;
      }

      case "list": {
        if (schema.type !== "sequence") throw new Error();

        schema.item = getSchema(response.item.id);

        return schema;
      }

      case "map": {
        if (schema.type !== "map") throw new Error();

        schema.properties = mapValues(
          response.properties,
          (prop) => getSchema(prop.schema.id),
        );

        return schema;
      }

      case "reference": {
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

  switch (response.type) {
    case "string": {
      if (response.term) {
        switch (response.term) {
          case "date": {
            return { title, control: DateControl };
          }
          case "datetime": {
            return { title, control: DatetimeControl };
          }
        }
      }
      return { title, control: TextControl };
    }
    case "number": {
      return { title, control: NumericControl };
    }
    case "boolean": {
      return { title, control: CheckboxControl };
    }

    case "reference": {
      return { title, control: TextControl };
    }
    case "map": {
      return { title, control: MapControl };
    }
    case "list": {
      return { title, control: ListControl };
    }
    case "union": {
      return { title, control: TextControl };
    }
  }
}

function createDefinitionContainer(
  response: SchemaResponse,
  presentation: Presentation,
): Definition {
  switch (response.type) {
    case "string":
      return {
        type: "string",
        term: response.format,
        presentation,
      };

    case "number":
      return {
        type: "number",
        presentation,
      };

    case "boolean":
      return { type: "boolean", presentation };

    case "union":
      return {
        type: "union",
        members: [],
        presentation,
      };

    case "list":
      return {
        type: "sequence",
        // deno-lint-ignore no-non-null-assertion
        item: undefined!,
        presentation,
      };

    case "map": {
      const required = Object.entries(response.properties).map(([key, prop]) =>
        prop.required ? key : null
      ).filter(isNonNullable);

      return {
        type: "map",
        properties: {},
        required,
        presentation,
      };
    }

    case "reference": {
      return {
        type: "reference",
        presentation,
        // target: undefined!,
      };
    }
  }
}

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !!value;
}
