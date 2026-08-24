import { os } from "../contract.ts";

export const getSchema = os.getResource.handler(async (options) => {
  const { context, input, errors } = options;

  const { params } = input;
  const { id } = params;

  const resource = await context.service.findResource(id);

  if (resource) return resource;

  throw errors.NOT_FOUND({
    data: {
      type: "about:blank",
      title: "Not Found",
      status: 404,
      detail: "",
      instance: options.path.join(),
    },
  });
});

export const getSchemas = os.getResources.handler(async (options) => {
  const { context } = options;
  const resources = await context.service.findResources();

  return resources;
});
