import type { Field, Summary } from "@cosmos/ui";
import type { Model, Schema } from "@cosmos/core";
import { mapValues } from "@std/collections/map-values";

export function modelToField(
  model: Model,
  getModel: (modelId: string) => Model,
  getIndexies: (modelId: string) => Summary[],
  getAssets: () => Summary[],
): Field {
  function to(
    schema: Schema,
    meta?: { required: boolean; description: string; title: string },
  ): Field {
    const required = meta?.required ?? false;
    const description = meta?.description ?? "";
    const title = meta?.title ?? "";

    switch (schema.type) {
      case "string": {
        return {
          type: "string",
          description,
          required,
          title,
        };
      }
      case "number": {
        return {
          type: "number",
          description,
          required,
          title,
        };
      }
      case "boolean": {
        return {
          type: "boolean",
          description,
          required,
          title,
        };
      }
      case "datetime": {
        return {
          type: "datetime",
          description,
          required,
          title,
        };
      }
      case "map": {
        const set = new Set(schema.required);
        const fields = mapValues(schema.props, (childModel, key) => {
          return to(childModel.schema, {
            required: set.has(key),
            description: childModel.description,
            title: childModel.title,
          });
        });
        return {
          type: "map",
          fields,
          title,
          description,
          required,
        };
      }
      case "list": {
        return {
          type: "list",
          field: to(schema.item),
          title,
          description,
          required,
        };
      }
      case "reference": {
        const candidates = getIndexies(schema.model);

        return {
          type: "reference",
          candidates,
          description,
          title,
          required,
        };
      }
      case "instance": {
        const childModel = getModel(schema.model);

        return to(childModel.schema, {
          description: childModel.description,
          title: childModel.title,
          required: false,
        });
      }
      case "union": {
        const variants = mapValues(
          schema.variants,
          (model) => to(model.schema),
        );
        return {
          type: "union",
          variants,
          title,
          description,
          required,
        };
      }
      case "asset": {
        const candidates = getAssets();

        return {
          type: "asset",
          title,
          description,
          required,
          candidates,
        };
      }
      case "markdown": {
        throw new Error();
      }
    }
  }

  return to(model.schema);
}
