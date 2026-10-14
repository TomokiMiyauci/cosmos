// deno-lint-ignore-file no-non-null-assertion
import { Admin, Page } from "@cosmos/studio";
import { renderToReadableStream } from "react-dom/server";
import { createElement } from "react";
import { type Route, route } from "@std/http/unstable-route";
import { default as config } from "./config.ts";
import { createHandler } from "@cosmos/content";
import { GraphqlProtocol } from "@cosmos/content-graphql";
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
import { router } from "./studio.ts";
import { join, relative } from "@std/path";
import { loadManifest } from "./manifest.ts";

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
    protocol: new GraphqlProtocol({ prefix: "/api" }),
    readers: {
      model: new ConfigModelQuery(config.models),
      schema: new ConfigSchemaQuery(config.schemas),
      entry: new ReaderEntryQuery(new DenoReader(locator)),
    },
  },
);

const distDir = join(import.meta.dirname!, "dist");

const manifest = await loadManifest(
  join(distDir, "manifest.json"),
);

const staticFiles = [...manifest.entries()].map((entry) => ({
  entry: join("/", relative(distDir, entry.path)),
  path: entry.path,
  mediaType: entry.mediaType,
  entrypoint: entry.entrypoint,
}));

const bootstrapModules = staticFiles.filter((meta) => meta.entrypoint).map((
  meta,
) => meta.entry);

const routes = [
  ...staticFiles.map((meta) => {
    return {
      pattern: new URLPattern({ pathname: meta.entry }),
      handler: async () => {
        const file = await Deno.open(meta.path);

        return new Response(file.readable, {
          headers: {
            "content-type": meta.mediaType,
          },
        });
      },
    };
  }),
  {
    pattern: new URLPattern({ pathname: "/api" }),
    handler: contentHandler,
  },
  {
    pattern: new URLPattern({ pathname: "*" }),
    handler: async (request) => {
      const url = new URL(request.url);
      const result = await router.route(url);
      let status = 200;
      const node = createElement(Admin, { route: result });

      if (result.type === Page.NotFound) {
        status = 404;
      }

      const stream = await renderToReadableStream(node, { bootstrapModules });

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

export default {
  async fetch(request): Promise<Response> {
    return await handler(request);
  },
} satisfies Deno.ServeDefaultExport;
