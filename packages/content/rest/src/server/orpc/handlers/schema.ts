import type { SchemaView } from "../../application/queries/schema.ts";
import type { SchemaResponse } from "../../../generated/types.gen.ts";
import { os } from "../contract.ts";

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

function toSchemaResopnse(schema: SchemaView): SchemaResponse {
  return {
    type: "string",
    title: "",
    description: "",
  };
}
