import { Admin, en, I18n, Page, Router } from "@cosmos/ui";
import { RestCmsService } from "@cosmos/ui/rest";
import { renderToReadableStream } from "react-dom/server";
import { createElement } from "react";
import config from "./config.ts";
import { createRestHandler } from "@cosmos/rest/server";
import { API_ENDPOINT } from "./constant.ts";
import { convert } from "@cosmos/config";
import { Route, route } from "@std/http/unstable-route";

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
      return api(request);
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
const router = new Router(service);

const api = createRestHandler({
  value: convert(config),
  location: new URL("./config.ts", import.meta.url),
}, "/api");
const i18n = new I18n(en);

export default {
  async fetch(request): Promise<Response> {
    return await handler(request);
  },
} satisfies Deno.ServeDefaultExport;
