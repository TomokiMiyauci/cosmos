// deno-lint-ignore-file no-namespace
import { EntryId } from "./id.ts";
import type { EntryRepositry } from "./repositry.ts";
import type { ModelId } from "../model/id.ts";
import type { SchemaValue } from "@cosmos/schema";

export class Entry {
  private constructor(
    id: EntryId,
    modelId: ModelId,
    content: SchemaValue,
    createdAt: Temporal.Instant,
    updatedAt: Temporal.Instant,
  ) {
    this.#id = id;
    this.#modelId = modelId;
    this.#content = content;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }
  readonly #id: EntryId;
  readonly #modelId: ModelId;
  readonly #content: SchemaValue;
  readonly #createdAt: Temporal.Instant;
  readonly #updatedAt: Temporal.Instant;

  static of(
    id: EntryId,
    modelId: ModelId,
    content: SchemaValue,
    createdAt: Temporal.Instant,
    updatedAt: Temporal.Instant,
  ): Entry {
    return new Entry(id, modelId, content, createdAt, updatedAt);
  }

  get id(): EntryId {
    return this.#id;
  }

  get modelId(): ModelId {
    return this.#modelId;
  }

  get content(): SchemaValue {
    return this.#content;
  }

  get createdAt(): Temporal.Instant {
    return this.#createdAt;
  }

  get updatedAt(): Temporal.Instant {
    return this.#updatedAt;
  }

  update(
    modelId: ModelId,
    content: SchemaValue,
    updatedAt: Temporal.Instant,
  ): Entry {
    return Entry.of(this.#id, modelId, content, this.#createdAt, updatedAt);
  }
}

export namespace Entry {
  export const Id = EntryId;
  export type Id = EntryId;
  export type Repositry = EntryRepositry;
  export type Content = SchemaValue;
}
