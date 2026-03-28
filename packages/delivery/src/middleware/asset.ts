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
      const asset = await ctx.fetcher.fetchAsset(origin.href);

      return new Response(asset.stream, {
        headers: {
          "content-type": asset.metadata.mediaType,
        },
      });
    }

    return ctx.next(request);
  }
}
