import type { SchemaView } from "../../application/queries/schema.ts";
import type {
  SchemaReference,
  SchemaResponse,
} from "../../../generated/types.gen.ts";
import { os } from "../contract.ts";
import { mapValues } from "@std/collections/map-values";

export const getSchema = os.getSchema.handler(async (options) => {
  const { context, input, errors } = options;

  const { params } = input;
  const { id } = params;

  const schema = await context.queries.schema.findById(id);

  if (!schema) {
    throw errors.NOT_FOUND({
      data: {
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "",
        instance: options.path.join(),
      },
    });
  }

  return toSchemaResopnse(schema);
});

export const getSchemas = os.getSchemas.handler(async (options) => {
  const { context } = options;
  const schemas = await context.queries.schema.findAll();

  return schemas.map(toSchemaResopnse);
});

function toSchemaResopnse(view: SchemaView): SchemaResponse {
  const id = view.id;

  switch (view.type) {
    case "string": {
      return { id, type: "string" };
    }
    case "number": {
      return { id, type: "number" };
    }
    case "map": {
      const properties = mapValues(view.properties, (property) => {
        const schema = schemaView2SchemaReference(property.schema);

        return { required: property.required, schema };
      });

      return { id, type: "map", properties };
    }
    case "boolean": {
      return { id, type: "boolean" };
    }
    case "temporal": {
      return { id, type: "temporal" };
    }
    case "list": {
      const item = schemaView2SchemaReference(view.item);

      return { id, type: "list", item };
    }
    case "reference": {
      // const schema = schemaView2SchemaReference(view.schema);

      return { id, type: "reference" };
    }
    case "union": {
      const schemas = view.schemas.map(schemaView2SchemaReference);

      return { id, type: "union", schemas };
    }
  }
}

function schemaView2SchemaReference(view: SchemaView): SchemaReference {
  return { id: view.id };
}
