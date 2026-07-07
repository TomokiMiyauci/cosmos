import type { Option } from "@miyauci/util";
import type { ModelId } from "./id.ts";
import type { Model } from "./entity.ts";

export interface ModelRepositry {
  findById(id: ModelId): Promise<Option<Model>>;
}
