import type { Model, Resource } from "@cosmos/core";

import type { CoreService, ParsedConfig } from "../handler.ts";

export class CmsServie implements CoreService {
  constructor(private config: ParsedConfig) {
  }

  async findResource(
    id: string,
  ): Promise<{ id: string; model: string } | null> {
    const resource = this.config.value.resources[id];

    if (!resource) return null;

    return {
      id,
      model: resource.model,
    };
  }

  async findResources(): Promise<Resource[]> {
    return Object.entries(this.config.value.resources).map(
      ([id, resource]) => {
        return { id, ...resource };
      },
    );
  }

  async findModels(): Promise<{
    id: string;
    model: Model;
  }[]> {
    return Object.entries(this.config.value.models).map(([id, model]) => {
      return {
        id,
        model,
      };
    });
  }

  findModel(id: string): Promise<Model | null> {
    const model = this.config.value.models[id];

    if (!model) return Promise.resolve(null);

    return Promise.resolve(model);
  }
}
