import { type Document, OpenAPIBackend, type Request } from "openapi-backend";
import type {
  MapSchema,
  Protocol,
  ProtocolContext,
  Schema,
} from "@cosmos/core";
import type { OpenAPIV3_1 } from "openapi-types";
import { renderUi } from "./util.ts";
import plural from "pluralize";
import { join } from "@std/path";

export class RestProtocol implements Protocol<ProtocolContext> {
  init(ctx: ProtocolContext): ProtocolContext {
    return ctx;
  }
  async handle(
    request: globalThis.Request,
    ctx: ProtocolContext,
  ): Promise<Response> {
    const url = new URL(request.url);
    const objectSchemas = Object.entries(ctx.manifest.schemas).filter((
      [_, schema],
    ) => schema.type === "map").map(([name, shcema]) => {
      const schemas = Object.entries((shcema as MapSchema).props).map((
        [name, schema],
      ) => [name, toJsonSchema(schema)] as const);

      const properties = Object.fromEntries(schemas);

      const schema = {
        type: "object",
        properties,
      } satisfies OpenAPIV3_1.SchemaObject;

      return [name, schema] as [string, OpenAPIV3_1.SchemaObject];
    });

    const paths = toPaths(objectSchemas);
    const definition = {
      info: { title: "Cosmos", version: "1.0.0" },
      openapi: "3.1.0",
      paths,
    } satisfies Document;
    const backend = new OpenAPIBackend({ definition });

    backend.registerHandler("notFound", () => {
      return new Response(null, { status: 404 });
    });

    if (new URLPattern({ pathname: "/" }).test(url)) {
      return new Response(renderUi("/openapi.json"), {
        headers: {
          "content-type": "text/html",
        },
      });
    }

    if (new URLPattern({ pathname: "/openapi.json" }).test(url)) {
      return new Response(JSON.stringify(definition), {
        headers: { "content-type": "application/json" },
      });
    }
    const req = toReq(request);
    const result = await backend.handleRequest(req);

    return result;
  }
}

function toReq(request: globalThis.Request): Request {
  const url = new URL(request.url);

  return {
    method: request.method,
    path: url.pathname,
    headers: {},
    body: request.body,
  };
}

function toJsonSchema(schema: Schema): OpenAPIV3_1.SchemaObject {
  switch (schema.type) {
    case "string": {
      return {
        type: "string",
        description: schema.description,
      };
    }
    case "boolean": {
      return {
        type: "boolean",
      };
    }
    case "datetime": {
      return {
        type: "number",
      };
    }
    case "asset": {
      return {
        type: "string",
      };
    }
    default: {
      return {};
    }
  }
}

function toPaths(
  obj: [string, OpenAPIV3_1.SchemaObject][],
): OpenAPIV3_1.PathsObject {
  return obj.reduce((acc, [name, schema]) => {
    const listName = plural(name);
    const listEndpoint = join("/", listName);
    const endpoint = join(listEndpoint, "{id}");

    return {
      ...acc,
      [endpoint]: {
        get: {
          responses: {
            200: {
              content: {
                "application/json": {
                  schema,
                },
              },
            },
          },
        },
      },
      [listEndpoint]: {
        get: {
          responses: {
            200: {
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: schema,
                  },
                },
              },
            },
          },
        },
      },
    } satisfies OpenAPIV3_1.PathsObject;
  }, {});
}
