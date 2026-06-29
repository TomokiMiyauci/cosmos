import type { Codec, Engine, Model, Schema } from "@cosmos/core";
import type { Config, ModelConfig, SchemaConfig } from "./type.ts";
import { mapValues } from "@std/collections";
import { type CodecMap, ParentCodec } from "./codec.ts";

export function convert(config: Config): Engine {
  const models = mapValues(config.models, toModel);
  const codec = toCodec(config.codec);

  return { ...config, models, codec };
}

function toModel(modelConfig: ModelConfig, key: string): Model {
  return {
    description: modelConfig.description ?? "",
    title: modelConfig.title ?? key,
    schema: toSchema(modelConfig.schema),
  };
}

function toSchema(schema: SchemaConfig): Schema {
  switch (schema.type) {
    case "string":
    case "number":
    case "boolean":
    case "reference":
    case "instance":
    case "asset":
    case "datetime": {
      return schema;
    }
    case "list": {
      return {
        type: "list",
        item: toSchema(schema.item),
      };
    }
    case "union": {
      return {
        type: "union",
        variants: mapValues(schema.variants, toModel),
      };
    }
    case "map": {
      return {
        type: "map",
        required: schema.required ?? [],
        props: mapValues(schema.props, toModel),
      };
    }
  }
}

function toCodec(map: CodecMap): Codec {
  return new ParentCodec(map);
}
