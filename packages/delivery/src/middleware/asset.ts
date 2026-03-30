import type { MiddlewareContext, MiddlewareObject } from "../type.ts";

export class Asset implements MiddlewareObject {
  #map: Map<string, URL> | undefined;
  constructor() {}

  async handle(
    request: Request,
    ctx: MiddlewareContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const origin = ctx.asset.lookup(url);

    if (origin) {
      const blog = await ctx.datalayer.asset.fetch(origin.href);

      return new Response(blog.stream(), {
        headers: {
          "content-type": blog.type,
        },
      });
    }

    return ctx.next(request);
  }
}
