import { contract } from "../generated/orpc.gen.ts";
import type {
  Entry,
  EntryInputDto,
  EntrySummary,
  Identitiy,
  Model,
  NewEntryInputDto,
  Resource,
} from "../generated/types.gen.ts";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { ContractRouterClient } from "@orpc/contract";
import { createORPCClient } from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";
import { Result } from "@miyauci/util";

export class Client {
  #client: JsonifiedClient<ContractRouterClient<typeof contract>>;

  constructor(baseUrl: URL) {
    const link = new OpenAPILink(contract, {
      url: baseUrl,
    });

    this.#client = createORPCClient(link);
  }

  async getEntrySummaries(
    optinos?: { model?: string },
  ): Promise<EntrySummary[]> {
    const result = await this.#client.getSummaries({
      query: { model: optinos?.model },
    });

    return result;
  }

  async postEntry(
    params: NewEntryInputDto,
  ): Promise<Result<Identitiy, ApiError<Problem>>> {
    const result = await this.#client.postEntry({ body: params });

    return Result.ok(result);
    // switch (result.status) {
    //   case 201: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async getEntry(
    id: string,
  ): Promise<Result<Entry, ApiError<NotFoundProblem>>> {
    const result = await this.#client.getEntry({ params: { id } }) as Entry;

    return Result.ok(result);
    // switch (result.status) {
    //   case 200: {
    //   }
    //   case 404: {
    //     throw Result.error(new ApiError({ status: 404 }));
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async putEntry(
    params: EntryInputDto & { id: string },
  ): Promise<Result<null, ApiError<Problem>>> {
    const result = await this.#client.putEntry({
      params: { id: params.id },
      body: { name: params.name, node: params.node },
    });

    return Result.ok(null);
    // switch (result.status) {
    //   case 204: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async deleteEntry(id: string): Promise<Result<null, ApiError<Problem>>> {
    const result = await this.#client.deleteEntry({ params: { id } });

    return Result.ok(null);
    // switch (result.status) {
    //   case 204: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async getResources(): Promise<
    Result<Resource[], ApiError<Problem>>
  > {
    const result = await this.#client.getResources();

    return Result.ok(result);
    // switch (result.status) {
    //   case 200: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async getResource(
    id: string,
  ): Promise<Result<Resource, ApiError<Problem>>> {
    const result = await this.#client.getResource({ params: { id } });

    return Result.ok(result);
    // switch (result.status) {
    //   case 200: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async getModels(): Promise<
    Result<Model[], ApiError<Problem>>
  > {
    const result = await this.#client.getModels();

    return Result.ok(result);
    // switch (result.status) {
    //   case 200: {
    //   }
    // }

    // throw new Error("Unknon status");
  }

  async getModel(
    id: string,
  ): Promise<Result<Model, ApiError<Problem>>> {
    const result = await this.#client.getModel({ params: { id } });

    return Result.ok(result);
    // switch (result.status) {
    //   case 200: {
    //   }
    // }

    // throw new Error("Unknon status");
  }
}

export class ApiError<T extends Problem> extends Error {
  constructor(problem: T) {
    super();

    this.problem = problem;
  }

  readonly problem: T;
}

type Problem =
  | InvalidArgumentProblem
  | ValidationErrorProblem
  | NotFoundProblem
  | InternalServerErrorProblem;

interface InvalidArgumentProblem {
  status: 400;
}

interface NotFoundProblem {
  status: 404;
}

interface ValidationErrorProblem {
  status: 422;
  errors: unknown;
}

interface InternalServerErrorProblem {
  status: 500;
}
