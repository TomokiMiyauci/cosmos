import type { Model, Resource } from "@cosmos/core";

import type { CoreService, ParsedConfig } from "../handler.ts";

export class CmsServie implements CoreService {
  constructor(private config: ParsedConfig) {
  }

  async findResource(
    id: string,
  ): Promise<Resource | null> {
    const resource = this.config.value.resources[id];

    if (!resource) return null;

    return resource;
  }

  async findResources(): Promise<Resource[]> {
    return Object.values(this.config.value.resources);
  }

  async findModels(): Promise<Model[]> {
    return Object.values(this.config.value.models);
  }

  findModel(id: string): Promise<Model | null> {
    const model = this.config.value.models[id];

    if (!model) return Promise.resolve(null);

    return Promise.resolve(model);
  }
}
