import type { ModelId } from "./id.ts";
import type { Model } from "./entity.ts";

export interface ModelRepositry {
  findById(id: ModelId): Promise<Model | null>;
}
