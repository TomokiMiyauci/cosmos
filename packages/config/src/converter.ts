import { Codec, Engine, M, Model, ModelId, Resource, S } from "@cosmos/core";
import type {
  Config,
  ModelConfig,
  ResourceConfig,
  SchemaConfig,
} from "./type.ts";
import { mapValues } from "@std/collections";
import { type CodecMap, ParentCodec } from "./codec.ts";
import { PoolStorage } from "./storage.ts";

export function convert(config: Config): Engine {
  const models = mapValues(
    config.models,
    (model, key) => toModel(model, key, config.models),
  );
  const codec = toCodec(config.codec);
  const storage = new PoolStorage(config.storages);
  const resources = mapValues(
    config.resources,
    (resource, id) => toResource(id, resource),
  );

  const modelRecords = mapValues(
    config.models,
    (model, key) => toM(key, model),
  );

  return {
    ...config,
    models,
    resources,
    codec,
    storage,
    repositories: {
      entry: config.repositry,
      model: {
        findById(modelId): Promise<M | null> {
          const model = modelRecords[modelId.value];

          return Promise.resolve(model ?? null);
        },
      },
    },
  };
}

function toM(
  key: string,
  model: ModelConfig,
): M {
  const [modelId, modelIdError] = ModelId.of(key);

  if (modelIdError) throw new Error();

  const schema = toSchema(model.schema);

  return M.of(modelId, schema);
}

function toSchema(schema: SchemaConfig): S {
  switch (schema.type) {
    case "string": {
      return { type: "string" };
    }
    case "number": {
      return { type: "number" };
    }
    case "boolean": {
      return { type: "boolean" };
    }
    case "datetime": {
      return {
        type: "datetime",
      };
    }
    case "union": {
      const variants = mapValues(
        schema.variants,
        (model) => toSchema(model.schema),
      );

      return { type: "union", variants };
    }
    case "reference": {
      return { type: "reference" };
    }
    case "instance": {
      throw new Error();
    }
    case "list": {
      return { type: "list", item: toSchema(schema.item) };
    }
    case "map": {
      const requiredSet = new Set(schema.required);
      const props = mapValues(schema.props, (model, key) => {
        const required = requiredSet.has(key);
        return { required, schema: toSchema(model.schema) };
      });

      return { type: "map", props };
    }
    case "asset": {
      throw new Error();
    }
  }
}

function toModel(
  modelConfig: ModelConfig,
  key: string,
  models: Record<string, ModelConfig>,
): Model {
  const description = modelConfig.description ?? "";
  const title = modelConfig.title ?? key;
  const id = key;

  switch (modelConfig.schema.type) {
    case "string": {
      return {
        id,
        title,
        description,
        type: "string",
      };
    }
    case "number": {
      return {
        id,
        title,
        description,
        type: "number",
      };
    }
    case "boolean": {
      return {
        id,
        title,
        description,
        type: "boolean",
      };
    }
    case "datetime": {
      return {
        id,
        title,
        description,
        type: "datetime",
      };
    }
    case "union": {
      const variants = mapValues(
        modelConfig.schema.variants,
        (model, key) => toModel(model, key, models),
      );
      return {
        id,
        type: "union",
        title,
        description,
        variants,
      };
    }
    case "reference": {
      return {
        id,
        type: "reference",
        title,
        description,
        model: modelConfig.schema.model,
      };
    }
    case "instance": {
      const childModelConfig = models[modelConfig.schema.model];

      if (!childModelConfig) throw new Error();

      return toModel(childModelConfig, modelConfig.schema.model, models);
    }
    case "list": {
      const item = toModel(
        { title: "", description: "", schema: modelConfig.schema.item },
        key,
        models,
      );

      return {
        id,
        type: "list",
        title,
        description,
        item,
      };
    }
    case "map": {
      const props = mapValues(
        modelConfig.schema.props,
        (childConfig, key) => toModel(childConfig, key, models),
      );
      const required = modelConfig.schema.required ?? [];

      return { id, type: "map", title, description, props, required };
    }
    case "asset": {
      return {
        id,
        type: "asset",
        title,
        description,
      };
    }
  }
}

function toCodec(map: CodecMap): Codec {
  return new ParentCodec(map);
}

function toResource(id: string, config: ResourceConfig): Resource {
  return {
    id,
    model: config.model,
    type: config.type,
    description: config.description ?? "",
  };
}
