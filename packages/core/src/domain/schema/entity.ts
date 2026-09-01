import { SchemaId } from "./id.ts";
import type { SchemaRepository } from "./repository.ts";
import type { Schema as SchemaDefinition } from "@cosmos/schema";

export class Schema {
  #id: SchemaId;
  #definition: SchemaDefinition;

  private constructor(id: SchemaId, definition: SchemaDefinition) {
    this.#id = id;
    this.#definition = definition;
  }

  static of(id: SchemaId, definition: SchemaDefinition): Schema {
    return new Schema(id, definition);
  }

  get id(): SchemaId {
    return this.#id;
  }

  get definition(): SchemaDefinition {
    return this.#definition;
  }
}

// deno-lint-ignore no-namespace
export namespace Schema {
  export const Id = SchemaId;
  export type Id = SchemaId;

  export type Repository = SchemaRepository;
  export type Definition = SchemaDefinition;
}
