import type { Middleware } from "@orpc/server";
import type { ResponseHeadersPluginContext } from "@orpc/server/plugins";

export interface Identity {
  id: string;
}

const locationMiddleware: Middleware<
  ResponseHeadersPluginContext,
  object,
  unknown,
  Identity,
  Record<PropertyKey, never>,
  object
> = async (
  options,
) => {
  const result = await options.next();

  const id = result.output.id;

  const location = `/${options.path}/${id}`;
  options.context.resHeaders?.set("location", location);

  return result;
};

export default locationMiddleware;
