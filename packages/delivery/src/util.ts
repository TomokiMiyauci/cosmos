import type {
  Handler,
  Middleware,
  MiddlewareContext,
  MiddlewareVariant,
} from "./type.ts";

interface ComponeContext extends Omit<MiddlewareContext, "next"> {}

export function compose(
  middlewares: Middleware[],
  handler: Handler,
  ctx: ComponeContext,
): Handler {
  return middlewares.reduceRight<Handler>((next, pipeline) => {
    return (request: Request) => {
      return pipeline(request, { next, ...ctx });
    };
  }, handler);
}

export function normalizeMiddleware(middleware: MiddlewareVariant): Middleware {
  if (typeof middleware === "function") return middleware;

  return middleware.handle.bind(middleware);
}
