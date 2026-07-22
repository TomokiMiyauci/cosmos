import type { Codec, Engine, Model, Resource } from "@cosmos/core";
import type { Config, ModelConfig, ResourceConfig } from "./type.ts";
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

  return { ...config, models, resources, codec, storage };
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
