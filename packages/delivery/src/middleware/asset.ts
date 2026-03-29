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
      const asset = await ctx.io.reader.read(origin);

      return new Response(asset.body, {
        headers: {
          "content-type": asset.header.mimeType,
        },
      });
    }

    return ctx.next(request);
  }
}
