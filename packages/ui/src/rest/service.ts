import type { CmsService, ContentsOption, Resource, Summary } from "../type.ts";
import {
  Client,
  type EntryResponse,
  type ModelResponse,
} from "@cosmos/content-rest/client";

export class RestCmsService implements CmsService {
  #client: Client;
  constructor(endpoint: URL) {
    this.#client = new Client(endpoint);
  }

  async #findResource(resourceId: string): Promise<ResourceDto | null> {
    const [data, error] = await this.#client.getModel(resourceId);

    if (error) {
      switch (error.problem.status) {
        case 404: {
          return null;
        }
      }
    }

    return data;
  }

  async findResource(id: string): Promise<Resource | null> {
    const [resource, error] = await this.#client.getModel(id);

    if (error) {
      switch (error.problem.status) {
        case 404: {
          return null;
        }
      }
    }

    return resource;
  }

  async #findContent(
    contentId: string,
  ): Promise<EntryResponse | null> {
    const [data, error] = await this.#client.getEntry(contentId);

    if (error) {
      switch (error.problem.status) {
        case 404: {
          return null;
        }
      }
    }

    return data;
  }

  async findSummaries(option?: ContentsOption): Promise<Summary[]> {
    let model: string | undefined;

    if (option?.resource) {
      const resource = await this.#findResource(option.resource);

      if (!resource) return [];

      model = resource.model;
    }

    const result = await this.#client.getEntrySummaries({ model });

    return result;
  }

  async findResources(): Promise<ModelResponse[]> {
    const data = await this.#client.getModels();

    return data;
  }
}
