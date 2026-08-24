import { os } from "../contract.ts";
import type { Model } from "../../../generated/types.gen.ts";

export const getModel = os.getModel.handler(async (options): Promise<Model> => {
  const { input, context } = options;
  const { id } = input.params;

  const model = await context.queries.model.findById(id);

  if (!model) {
    throw new Error();
  }

  return model;
});

export const getModels = os.getModels.handler(async (options) => {
  const { context } = options;

  const models = await context.service.findModels();

  return models;
});
