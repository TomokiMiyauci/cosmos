import type { Engine, Model, Resource } from "@cosmos/core";
import { CmsServie } from "./services/core.ts";
import { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";
import {
  type Contents,
  type CreateCommand,
  EntryCreateUseCase,
} from "./application/usecases/entry/creation.ts";
import {
  EntryUpdateUseCase,
  type UpdateCommand,
} from "./application/usecases/entry/updation.ts";
import { QueryService } from "./application/query.ts";
import { implement } from "@orpc/server";
import { contract } from "../patch.ts";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { toEntry } from "./util.ts";
import type {
  Contents as JsonContents,
  Entry,
  EntryInput,
  UpdateEntryInput,
} from "../generated/types.gen.ts";
import type { NodeJson } from "./application/dto.ts";
import { Result } from "@miyauci/util";
import { mapValues } from "@std/collections/map-values";
import { onError, ORPCError, ValidationError } from "@orpc/server";
import {
  ResponseHeadersPlugin,
  type ResponseHeadersPluginContext,
} from "@orpc/server/plugins";
import z from "zod";

const os = implement<typeof contract, Context & ResponseHeadersPluginContext>(
  contract,
);

const router = os.router({
  deleteEntry: os.deleteEntry.handler(async (options) => {
    const { context, input } = options;
    const { params } = input;
    const { id } = params;

    const [_, error] = await context.usecases.entryDelete.execute(id);

    if (error) {
      throw new Error();
      // return { status: 400, body: null };
    }
  }),
  getEntry: os.getEntry.handler(async (options): Promise<Entry> => {
    const { input, context } = options;
    const { params } = input;
    const { id } = params;

    const maybeDto = await context.queries.findById(id);

    if (!maybeDto) {
      throw new Error();
    }

    const entry = toEntry(maybeDto);

    return entry;
  }),
  postEntry: os.use(onError((error) => {
    if (
      error instanceof ORPCError &&
      error.code === "BAD_REQUEST" &&
      error.cause instanceof ValidationError
    ) {
      const zodError = new z.ZodError(error.cause.issues as z.core.$ZodIssue[]);

      if (zodError.issues.some((issue) => issue.code === "invalid_type")) {
        throw new ORPCError("BAD_REQUEST", {
          data: {},
        });
      }

      throw new ORPCError("UNPROCESSABLE_CONTENT", {
        data: {
          status: 422,
          detail: "",
          instance: "/",
          type: "about:blank",
          title: "Validation Failure",
          errors: [],
        },
      });
    }
  })).postEntry.handler(async (options) => {
    const { context, input, errors, path } = options;
    const { body } = input;
    const { model, name, contents: raw } = body as EntryInput;
    const contents = toContents(raw);
    const command = { model, name, contents } satisfies CreateCommand;

    const [id, error] = await context.usecases.entryCreate.execute(command);

    if (error) {
      switch (error.type) {
        case "MODEL_NOT_FOUND": {
          throw errors.CONFLICT({
            data: {
              status: 409,
              detail: "Model not found",
              instance: "/",
              type: "about:blank",
              title: "Model not found",
            },
          });
        }

        case "INVALID_NAME":
        case "INVALID_MODEL": {
          throw errors.INTERNAL_SERVER_ERROR({
            data: {
              status: 500,
              detail: "",
              instance: "/",
              type: "about:blank",
              title: "",
            },
          });
        }
        case "INVALID_CONTENT": {
          throw errors.UNPROCESSABLE_CONTENT({
            data: {
              status: 422,
              detail: "",
              instance: "/",
              type: "about:blank",
              title: "Validation failure",
              errors: [],
            },
          });
        }
      }
    }

    // TODO improve path construction
    const location = `${path}/${id}` as const;
    context.resHeaders?.set("location", location);

    return { id };
  }),
  getModel: os.getModel.handler(async (options): Promise<Model> => {
    const { input, context } = options;
    const { id } = input.params;

    const model = await context.service.findModel(id);

    if (!model) {
      throw new Error();
    }

    return model;
  }),
  getModels: os.getModels.handler(async (options) => {
    const { context } = options;

    const models = await context.service.findModels();

    return models;
  }),
  getResource: os.getResource.handler(async (options) => {
    const { context, input, errors } = options;

    const { params } = input;
    const { id } = params;

    const resource = await context.service.findResource(id);

    if (resource) return resource;

    throw errors.NOT_FOUND({
      data: {
        type: "about:blank",
        title: "Not Found",
        status: 404,
        detail: "",
        instance: options.path.join(),
      },
    });
  }),
  getResources: os.getResources.handler(async (options) => {
    const { context } = options;
    const resources = await context.service.findResources();

    return resources;
  }),
  getSummaries: os.getSummaries.handler(async (options) => {
    const { input, context } = options;

    const model = input?.query?.model;
    const dto = await context.queries.findSummaries({ model });

    return dto;
  }),
  putEntry: os.putEntry.handler(async (options) => {
    const { input, context } = options;
    const { params, body } = input;
    const { name, contents } = body as UpdateEntryInput;
    const { id } = params;

    const dto = await context.queries.findById(id);

    if (!dto) {
      throw new Error();
    }

    const maybeModel = await context.service.findModel(dto.model);

    if (!maybeModel) {
      throw new Error();
    }

    const [node, nodeError] = toNode(contents, maybeModel);

    if (nodeError) {
      throw new Error();
    }

    const command = {
      id,
      model: dto.model,
      name,
      node,
    } satisfies UpdateCommand;

    const [_, error] = await context.usecases.entryUpdate.execute(command);

    if (error) {
      throw new Error();
      // return {
      //   status: 400,
      //   body: null,
      // };
    }
  }),
});

export interface ParsedConfig {
  value: Engine;
  location: URL;
}

export interface CoreService {
  findResource(id: string): Promise<Resource | null>;

  findResources(): Promise<Resource[]>;
  findModel(id: string): Promise<Model | null>;
  findModels(): Promise<Model[]>;
}

interface Usecases {
  entryDelete: EntryDeleteUseCase;
  entryCreate: EntryCreateUseCase;
  entryUpdate: EntryUpdateUseCase;
}

interface Context {
  usecases: Usecases;
  queries: QueryService;
  service: CoreService;
}

export function createRestHandler(
  config: ParsedConfig,
  base: `/${string}`,
): (request: Request) => Promise<Response> {
  const handler = new OpenAPIHandler(router, {
    plugins: [new ResponseHeadersPlugin()],
  });

  const service = new CmsServie(config);
  const entryRepositry = config.value.repositories.entry;
  const modelRepositry = config.value.repositories.model;

  const usecases = {
    entryCreate: new EntryCreateUseCase(entryRepositry, modelRepositry),
    entryDelete: new EntryDeleteUseCase(entryRepositry),
    entryUpdate: new EntryUpdateUseCase(entryRepositry),
  } satisfies Usecases;
  const platformContext = {
    service,
    usecases,
    queries: new QueryService(config.value.reader),
  } satisfies Context;

  return async (request: Request) => {
    const result = await handler.handle(request, {
      context: platformContext,
      prefix: base,
    });

    return result.response ?? new Response(null, { status: 404 });
  };
}

function toNode(contents: Contents, model: Model): Result<NodeJson, Error> {
  switch (model.type) {
    case "string": {
      if (typeof contents === "string") {
        return Result.ok({ type: "string", value: contents });
      }

      return Result.error(new Error());
    }
    case "number": {
      if (typeof contents === "number") {
        return Result.ok({ type: "number", value: contents });
      }

      return Result.error(new Error());
    }
    case "boolean": {
      if (typeof contents === "boolean") {
        return Result.ok({ type: "boolean", value: contents });
      }

      return Result.error(new Error());
    }
    case "union": {
      if (Array.isArray(contents)) {
        const [first, second] = contents;

        if (typeof first === "string") {
          const childModel = model.variants[first];

          if (!childModel) {
            return Result.error(new Error());
          }

          const [value, valueError] = toNode(second, childModel);

          if (valueError) {
            return Result.error(valueError);
          }

          return Result.ok({ type: "union", key: first, value: value });
        }

        return Result.error(new Error());
      }

      return Result.error(new Error());
    }
    case "map": {
      if (typeof contents === "object" && !Array.isArray(contents)) {
        const values = mapValues(
          contents,
          (childContents, key) => toNode(childContents, model.props[key]!),
        );

        const value: Record<string, NodeJson> = {};

        for (const [key, [childNode, error]] of Object.entries(values)) {
          if (error) {
            return Result.error(error);
          }

          value[key] = childNode;
        }

        return Result.ok({
          type: "map",
          value,
        });
      }

      return Result.error(new Error());
    }
    case "datetime": {
      if (typeof contents === "string") {
        return Result.ok({
          type: "datetime",
          value: contents,
        });
      }

      return Result.error(new Error());
    }
    case "list": {
      if (Array.isArray(contents)) {
        const value: NodeJson[] = [];
        const items = contents.map((child) => toNode(child, model.item));

        for (const [node, error] of items) {
          if (error) {
            return Result.error(error);
          }

          value.push(node);
        }

        return Result.ok({ type: "list", value });
      }

      return Result.error(new Error());
    }
    case "reference": {
      if (typeof contents === "string") {
        return Result.ok({ type: "reference", value: contents });
      }

      return Result.error(new Error());
    }
    case "asset":
    case "markdown": {
      throw new Error();
    }
  }
}

function toContents(contents: JsonContents): Contents {
  if (typeof contents === "string") {
    return { type: "string", value: contents };
  }
  if (typeof contents === "number") {
    return { type: "number", value: contents };
  }

  if (typeof contents === "boolean") {
    return { type: "boolean", value: contents };
  }

  if (!Array.isArray(contents)) {
    const value = mapValues(contents, toContents);

    return { type: "record", value };
  }

  if (contents.length === 2 && typeof contents[0] === "string") {
    const child = contents[1];
    return {
      type: "keyed",
      key: contents[0],
      value: toContents(child),
    };
  }

  const value = contents.map(toContents);

  return {
    type: "list",
    value,
  };
}
