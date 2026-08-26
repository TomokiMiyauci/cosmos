import type { ModelResponse } from "../../../generated/types.gen.ts";
import type { ModelView } from "../../application/queries/model.ts";
import { os } from "../contract.ts";

export const getModel = os.getModel.handler(async (options) => {
  const { input, context, errors } = options;
  const { id } = input.params;

  const model = await context.queries.model.findById(id);

  if (!model) {
    throw errors.NOT_FOUND({
      data: { type: "", title: "", status: 404, instance: "/", detail: "" },
    });
  }

  return toModelResponse(model);
});

export const getModels = os.getModels.handler(async (options) => {
  const { context } = options;

  const models = await context.queries.model.findAll();

  return models.map(toModelResponse);
});

function toModelResponse(model: ModelView): ModelResponse {
  return {
    id: model.id,
    schema: {
      id: model.schemaId,
    },
    type: model.type,
  };
}
