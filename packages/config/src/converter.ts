import type { Engine, Model, Schema } from "@cosmos/core";
import type { Config, ModelConfig, SchemaConfig } from "./type.ts";
import { mapValues } from "@std/collections";

export function convert(config: Config): Engine {
  const models = mapValues(config.models, toModel);
  return { ...config, models, locators: {} };
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
