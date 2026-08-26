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
  constructor(private config: SchemaConfigMap) {
    const resolved = resolveSchemaConfig(config);

    this.#store = mapValues(resolved, schemaDefinition2Schema);
  }

  #store: Record<string, Schema>;

  findById(id: Schema.Id): Promise<Schema | null> {
    return Promise.resolve(this.#store[id.value] ?? null);
  }
}

function resolveSchemaConfig(
  store: Record<string, SchemaConfig>,
): Record<string, SchemaDefinition> {
  function to(
    config: SchemaConfig,
    id: string,
    resolve: (id: string) => SchemaDefinition,
  ): SchemaDefinition {
    switch (config.type) {
      case "string":
      case "number":
      case "boolean":
      case "temporal": {
        return { id, ...config };
      }
      case "map": {
        const props = mapValues(config.props, (prop) => {
          return {
            required: prop.required ?? false,
            schema: resolve(prop.to),
          };
        });

        return { id, type: "map", props };
      }
      case "list": {
        const item = resolve(config.item);

        return { id, type: "list", item };
      }
      case "union": {
        const schemas = config.schemas.map((schemaId) => resolve(schemaId));

        return { id, type: "union", schemas };
      }
      case "reference": {
        const schema = resolve(config.to);

        return { id, type: "reference", schema };
      }
    }
  }

  const map = new Map<string, SchemaDefinition>();

  function resolve(id: string): SchemaDefinition {
    const def = map.get(id);

    if (def) return def;

    const config = store[id];

    if (!config) throw new Error();

    return to(config, id, resolve);
  }

  const result = Object.entries(store).reduce<Record<string, SchemaDefinition>>(
    (acc, [key, config]) => {
      return {
        ...acc,
        [key]: to(config, key, resolve),
      };
    },
    {},
  );

  return result;
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

// (
//   definitions: SchemaConfigMap,
// ): Schema.Repository {
//   const records = mapValues(definitions, schemaDefinition2Schema);

//   return {
//     findById: (id) => {
//       const schema = records[id.value];

//       return Promise.resolve(schema ?? null);
//     },
//   };
// }

function schemaDefinition2Schema(
  definition: SchemaDefinition,
): Schema {
  const [id, idError] = Schema.Id.of(definition.id);

  if (idError) throw idError;

  switch (definition.type) {
    case "string": {
      return { type: "string", id, format: null };
    }
    case "number": {
      return { type: "number", id };
    }
    case "map": {
      const properties = mapValues(definition.props, (prop) => {
        return {
          required: prop.required,
          schema: schemaDefinition2Schema(prop.schema),
        };
      });

      return { id, type: "map", properties };
    }
    case "boolean": {
      return { id, type: "boolean" };
    }
    case "temporal": {
      return { id, type: "temporal" };
    }
    case "reference": {
      const schema = schemaDefinition2Schema(definition.schema);

      return { id, type: "reference", schema };
    }
    case "list": {
      const schema = schemaDefinition2Schema(definition.item);

      return { id, type: "list", schema };
    }
    case "union": {
      const members = definition.schemas.map(schemaDefinition2Schema);

      return { id, type: "union", members };
    }
  }
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
    const resolved = resolveSchemaConfig(definition);

    this.store = mapValues(resolved, schemaDefinitionToSchemaView);
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

function schemaDefinitionToSchemaView(
  definition: SchemaDefinition,
): SchemaView {
  const id = definition.id;

  switch (definition.type) {
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
    case "list": {
      const item = schemaDefinitionToSchemaView(definition.item);

      return { id, type: "list", item };
    }
    case "map": {
      const properties = mapValues(definition.props, (child) => {
        const schema = schemaDefinitionToSchemaView(child.schema);

        return {
          required: child.required,
          schema,
        };
      });
      return { id, type: "map", properties };
    }
    case "union": {
      const schemas = definition.schemas.map(schemaDefinitionToSchemaView);

      return { id, type: "union", schemas };
    }
    case "reference": {
      const schema = schemaDefinitionToSchemaView(definition.schema);

      return { id, type: "reference", schema };
    }
  }
}
