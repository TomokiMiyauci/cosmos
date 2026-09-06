import { contract } from "../server/orpc/contract.ts";
import type {
  DeleteEntryData,
  DeleteEntryResponses,
  GetEntryData,
  GetEntryErrors,
  GetEntryResponses,
  GetModelData,
  GetModelErrors,
  GetModelResponses,
  GetModelsResponses,
  GetSchemaData,
  GetSchemaErrors,
  GetSchemaResponses,
  GetSchemasResponses,
  GetSummariesData,
  GetSummariesResponses,
  PostEntryData,
  PostEntryErrors,
  PostEntryResponses,
  PutEntryData,
  PutEntryErrors,
  PutEntryResponses,
} from "../generated/types.gen.ts";
import type { JsonifiedClient } from "@orpc/openapi-client";
import type { ContractRouterClient, ORPCError } from "@orpc/contract";
import {
  COMMON_ORPC_ERROR_DEFS,
  type CommonORPCErrorCode,
  createORPCClient,
  createSafeClient,
  isDefinedError,
  type SafeClient,
} from "@orpc/client";
import { OpenAPILink } from "@orpc/openapi-client/fetch";

type ToResponse<T> = { [S in keyof T]: { status: S; body: T[S] } }[keyof T];

type OmitOptionalNever<T> = {
  [
    // deno-lint-ignore ban-types
    K in keyof T as {} extends Pick<T, K>
      ? [Exclude<T[K], undefined>] extends [never] ? never
      : K
      : K
  ]: T[K];
};

type ToInput<T> = Omit<OmitOptionalNever<T>, "url">;

export type GetEntryInput = ToInput<GetEntryData>;

export type GetEntryResponse = ToResponse<GetEntryResponses & GetEntryErrors>;

export type PostEntryInput = ToInput<PostEntryData>;

export type PostEntryResponse = ToResponse<
  PostEntryResponses & PostEntryErrors
>;

export type PutEntryInput = ToInput<PutEntryData>;

export type PutEntryResponse = ToResponse<PutEntryResponses & PutEntryErrors>;

export type GetSchemaResponse = ToResponse<
  GetSchemaResponses & GetSchemaErrors
>;

export type GetSchemaInput = ToInput<GetSchemaData>;

export type GetSchemasResponse = ToResponse<GetSchemasResponses>;

export type GetModelInput = ToInput<GetModelData>;

export type GetModelResponse = ToResponse<GetModelResponses & GetModelErrors>;

export type GetModelsResponse = ToResponse<GetModelsResponses>;

export type DeleteEntryInput = ToInput<DeleteEntryData>;
export type DeleteEntryResponse = ToResponse<DeleteEntryResponses>;

export type GetSummariesInput = ToInput<GetSummariesData>;
export type GetSummariesResponse = ToResponse<GetSummariesResponses>;

export class Client {
  #client: SafeClient<JsonifiedClient<ContractRouterClient<typeof contract>>>;

  constructor(baseUrl: URL) {
    const link = new OpenAPILink(contract, {
      url: baseUrl,
    });
    const client: JsonifiedClient<ContractRouterClient<typeof contract>> =
      createORPCClient(link);

    this.#client = createSafeClient(client);
  }

  /**
   * @throws
   */
  async getEntrySummaries(
    input: GetSummariesInput,
  ): Promise<GetSummariesResponse> {
    const [error, data] = await this.#client.getSummaries(input);

    if (error) throw error;

    return { status: 200, body: data };
  }

  /**
   * @throws
   */
  async postEntry(input: PostEntryInput): Promise<PostEntryResponse> {
    const [error, data] = await this.#client.postEntry(input);

    if (error) {
      if (!isDefinedError(error)) throw error;

      return fromError(error);
    }

    return { status: 201, body: data };
  }

  /**
   * @throws
   */
  async getEntry(input: GetEntryInput): Promise<GetEntryResponse> {
    const [error, data] = await this.#client.getEntry({ params: input.path });

    if (error) {
      if (!isDefinedError(error)) throw error;

      return fromError(error);
    }

    return {
      status: 200,
      body: { id: data.id, model: data.model, contents: data.contents },
    };
  }

  /**
   * @throws
   */
  async putEntry(input: PutEntryInput): Promise<PutEntryResponse> {
    const [error] = await this.#client.putEntry({
      body: input.body,
      params: input.path,
    });

    if (error) {
      if (!isDefinedError(error)) throw error;

      return fromError(error);
    }

    return { status: 204, body: void 0 };
  }

  /**
   * @throws
   */
  async deleteEntry(
    input: DeleteEntryInput,
  ): Promise<DeleteEntryResponse> {
    const [error] = await this.#client.deleteEntry({ params: input.path });

    if (error) throw error;

    return { status: 204, body: void 0 };
  }

  /**
   * @throws
   */
  async getSchemas(): Promise<GetSchemasResponse> {
    const [error, data] = await this.#client.getSchemas();

    if (error) throw error;

    return { status: 200, body: data };
  }

  /**
   * @throws
   */
  async getSchema(input: GetSchemaInput): Promise<GetSchemaResponse> {
    const [error, data] = await this.#client.getSchema({ params: input.path });

    if (error) {
      if (!isDefinedError(error)) {
        throw error;
      }

      return fromError(error);
    }

    return { status: 200, body: data };
  }

  /**
   * @throws
   */
  async getModels(): Promise<GetModelsResponse> {
    const [error, data] = await this.#client.getModels();

    if (error) throw error;

    return { status: 200, body: data };
  }

  /**
   * @throws
   */
  async getModel(input: GetModelInput): Promise<GetModelResponse> {
    const [error, data] = await this.#client.getModel({ params: input.path });

    if (error) {
      if (!isDefinedError(error)) {
        throw error;
      }

      return fromError(error);
    }

    return { status: 200, body: data };
  }
}

function toStatus<T extends CommonORPCErrorCode>(
  code: T,
): typeof COMMON_ORPC_ERROR_DEFS[T]["status"] {
  return COMMON_ORPC_ERROR_DEFS[code].status;
}

type ToStatus<T extends CommonORPCErrorCode> =
  typeof COMMON_ORPC_ERROR_DEFS[T]["status"];

// deno-lint-ignore no-explicit-any
function fromError<T extends ORPCError<any, any>>(
  error: T,
): T extends ORPCError<infer U extends CommonORPCErrorCode, infer V>
  ? { status: ToStatus<U>; body: V }
  : never {
  // deno-lint-ignore no-explicit-any
  return { status: toStatus(error.code), body: error.data } as any;
}
