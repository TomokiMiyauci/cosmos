import { Admin, Router } from "@cosmos/ui";
import { renderToReadableStream } from "react-dom/server";
import { createElement } from "react";
import config from "./config.ts";
import { createHandler } from "@cosmos/api";
import { Service } from "@cosmos/service";
import { API_ENDPOINT } from "./constant.ts";

const bundleResult = await Deno.bundle({
  entrypoints: [
    "./client.tsx",
  ],
  write: false,
  format: "esm",
  platform: "browser",
});

const router = new Router();
const entry = "/main.js";
const pattern = new URLPattern({
  pathname: entry,
});

const endpoint = new URL(API_ENDPOINT);

const api = createHandler(config, endpoint);
const service = new Service(endpoint);

export default {
  async fetch(request): Promise<Response> {
    if (new URLPattern({ pathname: "/api/*" }).test(request.url)) {
      return await api(request);
    }

    const url = new URL(request.url);

    if (pattern.test(url)) {
      return new Response(bundleResult.outputFiles[0]?.contents, {
        headers: {
          "content-type": "application/javascript",
          "cache-control": "no-store",
          Vary: "*",
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "*",
          "access-control-allow-headers": "*",
        },
      });
    }

    const result = router.route(url);
    let status = 200;
    const node = createElement(Admin, { service, route: result });

    if (result.type === "not-found") {
      status = 404;
    }
    const stream = await renderToReadableStream(node, {
      "bootstrapModules": [entry],
    });

    await stream.allReady;

    return new Response(stream, { status });
  },
} satisfies Deno.ServeDefaultExport;
