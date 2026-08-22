import type { ModelId } from "./id.ts";
import type { SchemaId } from "../schema/id.ts";

export type ModelType = "collection" | "singleton";

export class Model {
  readonly #id: ModelId;
  readonly #schemaId: SchemaId;

  private constructor(
    id: ModelId,
    schemaId: SchemaId,
    readonly type: ModelType,
  ) {
    this.#id = id;
    this.#schemaId = schemaId;
  }

  static of(id: ModelId, schemaId: SchemaId, type: ModelType): Model {
    return new Model(id, schemaId, type);
  }

  get id(): ModelId {
    return this.#id;
  }

  get schemaId(): SchemaId {
    return this.#schemaId;
  }
}
