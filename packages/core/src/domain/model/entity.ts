import type { ModelId } from "./id.ts";
import type { Schema } from "./schema.ts";

export class Model {
  readonly #id: ModelId;
  readonly #schema: Schema;

  private constructor(id: ModelId, schema: Schema) {
    this.#id = id;
    this.#schema = schema;
  }

  static of(id: ModelId, schema: Schema): Model {
    return new Model(id, schema);
  }

  get id(): ModelId {
    return this.#id;
  }

  get schema(): Schema {
    return this.#schema;
  }
}
