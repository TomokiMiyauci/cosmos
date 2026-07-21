import type { Engine, Model, Resource } from "@cosmos/core";
import { CmsServie } from "./services/core.ts";
import { EntryDeleteUseCase } from "./application/usecases/entry/deletion.ts";
import { EntryCreateUseCase } from "./application/usecases/entry/creation.ts";
import { EntryUpdateUseCase } from "./application/usecases/entry/updation.ts";
import { QueryService } from "./application/query.ts";
import { implement } from "@orpc/server";
import { contract } from "../generated/orpc.gen.ts";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { toEntry } from "./util.ts";

const os = implement<typeof contract, Context>(contract);

const router = os.router({
  deleteEntry: os.deleteEntry.handler(async (options) => {
    const { context, input } = options;
    const { params } = input;
    const { id } = params;

    const result = await context.usecases.entryDelete.execute(id);

    if (!result.ok) {
      throw new Error();
      // return { status: 400, body: null };
    }
  }),
  getEntry: os.getEntry.handler(async (options) => {
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
  postEntry: os.postEntry.handler(async (options) => {
    const { context, input } = options;

    const result = await context.usecases.entryCreate.execute(input.body);

    if (!result.ok) {
      throw new Error();
      // return { status: 400, body: undefined };
    }

    const dto = result.value;

    // TODO improve path construction
    // const location = `${ctx.appRoute.path}/${dto.id}` as const;
    // ctx.responseHeaders.append("location", location);

    return dto;
  }),
  getModel: os.getModel.handler(async (options) => {
    const { input, context } = options;
    const { id } = input.params;

    const model = await context.service.findModel(id);

    if (!model) {
      throw new Error();
    }

    return { id, ...model };
  }),
  getModels: os.getModels.handler(async (options) => {
    const { context } = options;

    const models = await context.service.findModels();

    return models.map((model) => ({ id: model.id, ...model.model }));
  }),
  getResource: os.getResource.handler(async (options) => {
    const { context, input } = options;
    const { params } = input;
    const { id } = params;

    const identifies = await context.service.findResource(id);

    if (identifies) {
      return identifies;
    }

    throw new Error();

    // return { status: 404, body: undefined };
  }),
  getResources: os.getResources.handler(async (options) => {
    const { context } = options;
    const identifies = await context.service.findResources();

    return identifies;
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
    const { id } = params;

    const result = await context.usecases.entryUpdate.execute(id, body);

    if (!result.ok) {
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
  findResource(id: string): Promise<{ id: string; model: string } | null>;

  findResources(): Promise<Resource[]>;
  findModel(id: string): Promise<Model | null>;
  findModels(): Promise<{ id: string; model: Model }[]>;
}

export interface HandlerContext {
  result: URLPatternResult;
  service: CoreService;
  usecases: Usecases;
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
  const handler = new OpenAPIHandler(router);

  const service = new CmsServie(config);
  const repositry = config.value.repositry;

  const usecases = {
    entryCreate: new EntryCreateUseCase(repositry),
    entryDelete: new EntryDeleteUseCase(repositry),
    entryUpdate: new EntryUpdateUseCase(repositry),
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
