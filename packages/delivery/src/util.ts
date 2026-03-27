import type { Handler, Middleware, MiddlewareVariant } from "./type.ts";

export function compose(middlewares: Middleware[], handler: Handler): Handler {
  return middlewares.reduceRight<Handler>((next, pipeline) => {
    return (request: Request) => {
      return pipeline(request, { next });
    };
  }, handler);
}

export function normalizeMiddleware(middleware: MiddlewareVariant): Middleware {
  if (typeof middleware === "function") return middleware;

  return middleware.handle.bind(middleware);
}
