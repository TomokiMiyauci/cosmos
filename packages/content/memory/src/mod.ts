import { Model, Schema } from "@cosmos/core";
import { mapValues } from "@std/collections/map-values";
import type {
  Config,
  ModelConfig,
  SchemaConfig,
  SchemaConfigMap,
} from "@cosmos/config";
import type {
  ModelQuery,
  ModelView,
  SchemaQuery,
  SchemaView,
} from "@cosmos/content-rest/server";
export interface ModelDefinitionMap {
  [k: string]: ModelDefinition;
}

export interface ModelDefinition {
  schema: string;
  type: "collection" | "singleton";
}

export function createModelRepository(
  definitions: ModelDefinitionMap,
): Model.Repositry {
  const records = mapValues(definitions, modelDefinition2Model);
  return {
    findById: (id) => {
      const model = records[id.value];

      return Promise.resolve(model ?? null);
    },
  };
}

export interface SchemaDefinitionMap {
  [k: string]: SchemaDefinition;
}
export class ConfigSchemaRepository implements Schema.Repository {
  constructor(config: SchemaConfigMap) {
    const resolved = resolveSchemaConfig(config);

    this.#store = resolved;
  }

  #store: Record<string, Schema>;

  findById(id: Schema.Id): Promise<Schema | null> {
    return Promise.resolve(this.#store[id.value] ?? null);
  }
}

function resolveSchemaConfig(
  store: Record<string, SchemaConfig>,
): Record<string, Schema> {
  const definitions = new Map<string, Schema>();

  for (const [id, schema] of Object.entries(store)) {
    definitions.set(id, createContainerSchema(schema, id));
  }

  for (const [id, config] of Object.entries(store)) {
    linkSchema(config, id);
  }

  return Object.fromEntries(definitions);

  function linkSchema(
    config: SchemaConfig,
    id: string,
  ): void {
    const schema = definitions.get(id);

    if (!schema) throw new Error();

    const definition = schema.definition;

    switch (definition.type) {
      case "string":
      case "number":
      case "boolean":
      case "temporal": {
        break;
      }
      case "map": {
        if (config.type !== "map") throw new Error();

        const properties = mapValues(config.props, (prop) => {
          return getSchema(prop.to);
        });

        definition.properties = properties;

        break;
      }
      case "sequence": {
        if (config.type !== "list") throw new Error();

        const item = getSchema(config.item);

        definition.item = item;

        break;
      }
      case "union": {
        if (config.type !== "union") throw new Error();

        const members = config.schemas.map(getSchema);

        definition.members = members;

        break;
      }
      case "reference": {
        if (config.type !== "reference") throw new Error();

        const schema = getSchema(config.to);

        definition.target = schema;

        break;
      }
    }
  }

  function getSchema(id: string): Schema.Definition {
    const definition = definitions.get(id);

    if (!definition) throw new Error();

    return definition.definition;
  }
}

function createContainerSchema(
  config: SchemaConfig,
  rawId: string,
): Schema {
  const [id, idError] = Schema.Id.of(rawId);

  if (idError) throw new Error();

  switch (config.type) {
    case "string": {
      return Schema.of(id, { type: "string" });
    }
    case "number": {
      return Schema.of(id, { type: "number" });
    }
    case "boolean": {
      return Schema.of(id, { type: "boolean" });
    }
    case "temporal": {
      throw new Error();
    }
    case "map": {
      const required = Object.entries(config.props).map(([key, prop]) =>
        prop.required ? key : null
      ).filter(isNonNullable);

      return Schema.of(id, { type: "map", properties: {}, required });
    }
    case "list": {
      return Schema.of(id, { type: "sequence", item: PLACEHOLDER });
    }
    case "union": {
      return Schema.of(id, { type: "union", members: [] });
    }
    case "reference": {
      return Schema.of(id, { type: "reference", target: PLACEHOLDER });
    }
  }
}

export type SchemaDefinition =
  | StringSchemaDefinition
  | NumberSchemaDefinition
  | BooleanSchemaDefinition
  | TemporalSchemaDefinition
  | ListSchemaDefinition
  | MapSchemaDefiinition
  | UnionSchemaDefinition
  | ReferenceSchemaDefintion;

interface BaseSchemaDefinition {
  id: string;
}

export interface StringSchemaDefinition extends BaseSchemaDefinition {
  type: "string";
}

export interface NumberSchemaDefinition extends BaseSchemaDefinition {
  type: "number";
}

export interface BooleanSchemaDefinition extends BaseSchemaDefinition {
  type: "boolean";
}

export interface TemporalSchemaDefinition extends BaseSchemaDefinition {
  type: "temporal";
}

export interface ListSchemaDefinition extends BaseSchemaDefinition {
  type: "list";
  item: SchemaDefinition;
}

export interface MapSchemaDefiinition extends BaseSchemaDefinition {
  type: "map";
  props: Record<string, { required: boolean; schema: SchemaDefinition }>;
}

export interface UnionSchemaDefinition extends BaseSchemaDefinition {
  type: "union";
  schemas: SchemaDefinition[];
}

export interface ReferenceSchemaDefintion extends BaseSchemaDefinition {
  type: "reference";
  schema: SchemaDefinition;
}

function modelDefinition2Model(
  definition: ModelDefinition,
  key: string,
): Model {
  const [modelId, modelIdError] = Model.Id.of(key);

  if (modelIdError) throw modelIdError;

  const [schemaId, schemaIdError] = Schema.Id.of(definition.schema);

  if (schemaIdError) throw schemaIdError;

  return Model.of(modelId, schemaId, definition.type);
}

export class ConfigModelQuery implements ModelQuery {
  constructor(definition: Config["models"]) {
    this.store = mapValues(definition, modelDefinitionToModelView);
  }

  store: Record<string, ModelView>;

  findById(id: string): Promise<ModelView | null> {
    return Promise.resolve(this.store[id] ?? null);
  }
  findAll(): Promise<ModelView[]> {
    return Promise.resolve(Object.values(this.store));
  }
}

export class ConfigSchemaQuery implements SchemaQuery {
  constructor(definition: Config["schemas"]) {
    const resolved = resolveConfig2SchemaView(definition);

    this.store = resolved;
  }

  store: Record<string, SchemaView>;

  findById(id: string): Promise<SchemaView | null> {
    return Promise.resolve(this.store[id] ?? null);
  }
  findAll(): Promise<SchemaView[]> {
    return Promise.resolve(Object.values(this.store));
  }
}

function modelDefinitionToModelView(
  definition: ModelConfig,
  key: string,
): ModelView {
  return {
    id: key,
    schemaId: definition.schema,
    type: definition.type,
  };
}

function resolveConfig2SchemaView(
  store: Record<string, SchemaConfig>,
): Record<string, SchemaView> {
  const definitions = new Map<string, SchemaView>();

  for (const [id, schema] of Object.entries(store)) {
    definitions.set(id, createContainerSchemaView(schema, id));
  }

  for (const [id, config] of Object.entries(store)) {
    linkSchema(config, id);
  }

  return Object.fromEntries(definitions);

  function linkSchema(
    config: SchemaConfig,
    id: string,
  ): void {
    const definition = definitions.get(id);

    if (!definition) throw new Error();

    switch (definition.type) {
      case "string":
      case "number":
      case "boolean":
      case "temporal": {
        break;
      }
      case "map": {
        if (config.type !== "map") throw new Error();

        const properties = mapValues(config.props, (prop) => {
          return {
            required: prop.required ?? false,
            schema: getSchema(prop.to),
          };
        });

        definition.properties = properties;

        break;
      }
      case "list": {
        if (config.type !== "list") throw new Error();

        const item = getSchema(config.item);

        definition.item = item;

        break;
      }
      case "union": {
        if (config.type !== "union") throw new Error();

        const members = config.schemas.map(getSchema);

        definition.schemas = members;

        break;
      }
      case "reference": {
        if (config.type !== "reference") throw new Error();

        const schema = getSchema(config.to);

        definition.schema = schema;

        break;
      }
    }
  }

  function getSchema(id: string): SchemaView {
    const definition = definitions.get(id);

    if (!definition) throw new Error();

    return definition;
  }
}

function createContainerSchemaView(
  config: SchemaConfig,
  id: string,
): SchemaView {
  switch (config.type) {
    case "string": {
      return { id, type: "string" };
    }
    case "number": {
      return { id, type: "number" };
    }
    case "boolean": {
      return { id, type: "boolean" };
    }
    case "temporal": {
      return { id, type: "temporal" };
    }
    case "map": {
      return { id, type: "map", properties: {} };
    }
    case "list": {
      return { id, type: "list", item: PLACEHOLDER };
    }
    case "union": {
      return { id, type: "union", schemas: [] };
    }
    case "reference": {
      return { id, type: "reference", schema: PLACEHOLDER };
    }
  }
}

const PLACEHOLDER = undefined as any;

function isNonNullable<T>(value: T): value is NonNullable<T> {
  return !!value;
}
