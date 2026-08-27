import { Admin, en, I18n, Page, Router } from "@cosmos/ui";
import { RestCmsService } from "@cosmos/ui/rest";
import { renderToReadableStream } from "react-dom/server";
import { createElement } from "react";
import { API_ENDPOINT } from "./constant.ts";
import { Route, route } from "@std/http/unstable-route";
import { default as config } from "./config.ts";
import { createHandler } from "@cosmos/content";
import { RestProtocol } from "@cosmos/content-rest/server";
import {
  ConfigModelQuery,
  ConfigSchemaQuery,
  ConfigSchemaRepository,
  createModelRepository,
} from "@cosmos/content-memory";
import {
  BaseLocator,
  DenoReader,
  DenoStore,
  ReaderEntryQuery,
  StoreEntryRepository,
} from "@cosmos/content-fs";
import { queries } from "./query.ts";

const locator = new BaseLocator(
  new URL(import.meta.resolve("./contents/posts/")),
);

export const contentHandler = createHandler(
  {
    repositories: {
      model: createModelRepository(config.models),
      schema: new ConfigSchemaRepository(config.schemas),
      entry: new StoreEntryRepository(new DenoStore(locator)),
    },
  },
  new RestProtocol({
    queries: {
      model: new ConfigModelQuery(config.models),
      schema: new ConfigSchemaQuery(config.schemas),
      entry: new ReaderEntryQuery(new DenoReader(locator)),
    },
    prefix: "/api",
  }),
);

const entry = "/main.js";

const routes = [
  {
    pattern: new URLPattern({ pathname: entry }),
    handler: () => {
      return new Response(bundleResult.outputFiles?.[0]?.contents, {
        headers: {
          "content-type": "application/javascript",
          "cache-control": "no-store",
          Vary: "*",
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
        },
      });
    },
  },
  {
    pattern: new URLPattern({ pathname: "/api/*" }),
    handler: (request) => {
      return contentHandler(request);
    },
  },
  {
    pattern: new URLPattern({ pathname: "*" }),
    handler: async (request) => {
      const url = new URL(request.url);
      const result = await router.route(url);
      let status = 200;
      const node = createElement(Admin, {
        service,
        route: result,
        translation: i18n,
      });

      if (result.type === Page.NotFound) {
        status = 404;
      }

      const stream = await renderToReadableStream(node, {
        "bootstrapModules": [entry],
      });

      await stream.allReady;

      return new Response(stream, {
        status,
        headers: {
          "content-type": "text/html;charset=utf-8",
        },
      });
    },
  },
] satisfies Route[];

const handler = route(routes, () => new Response(null, { status: 404 }));

const bundleResult = await Deno.bundle({
  entrypoints: ["./client.tsx"],
  write: false,
  format: "esm",
  platform: "browser",
});

const endpoint = new URL(API_ENDPOINT);
const service = new RestCmsService(endpoint);
const router = new Router(service, queries);
const i18n = new I18n(en);

export default {
  async fetch(request): Promise<Response> {
    return await handler(request);
  },
} satisfies Deno.ServeDefaultExport;
