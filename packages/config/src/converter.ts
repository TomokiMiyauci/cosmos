import type { Codec, Engine, Model } from "@cosmos/core";
import type { Config, ModelConfig } from "./type.ts";
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

  return { ...config, models, codec, storage };
}

function toModel(
  modelConfig: ModelConfig,
  key: string,
  models: Record<string, ModelConfig>,
): Model {
  const description = modelConfig.description ?? "";
  const title = modelConfig.title ?? key;

  switch (modelConfig.schema.type) {
    case "string": {
      return {
        title,
        description,
        type: "string",
      };
    }
    case "number": {
      return {
        title,
        description,
        type: "number",
      };
    }
    case "boolean": {
      return {
        title,
        description,
        type: "boolean",
      };
    }
    case "datetime": {
      return {
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
        type: "union",
        title,
        description,
        variants,
      };
    }
    case "reference": {
      return {
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

      return { type: "map", title, description, props, required };
    }
    case "asset": {
      return {
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
