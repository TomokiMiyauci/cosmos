import type { CmsService, Resource } from "../type.ts";
import { Client, type ModelResponse } from "@cosmos/content-rest/client";

export class RestCmsService implements CmsService {
  #client: Client;
  constructor(endpoint: URL) {
    this.#client = new Client(endpoint);
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

  async findResources(): Promise<ModelResponse[]> {
    const data = await this.#client.getModels();

    return data;
  }
}
