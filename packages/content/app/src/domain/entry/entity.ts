// deno-lint-ignore-file no-namespace
import { EntryId } from "./id.ts";
import type { EntryRepositry } from "./repositry.ts";
import type { ModelId } from "../model/id.ts";
import type { SchemaValue } from "@cosmos/schema";

export class Entry {
  private constructor(id: EntryId, modelId: ModelId, content: SchemaValue) {
    this.#id = id;
    this.#modelId = modelId;
    this.#content = content;
  }
  readonly #id: EntryId;
  readonly #modelId: ModelId;
  readonly #content: SchemaValue;

  static of(id: EntryId, modelId: ModelId, content: SchemaValue): Entry {
    return new Entry(id, modelId, content);
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
}

export namespace Entry {
  export const Id = EntryId;
  export type Id = EntryId;
  export type Repositry = EntryRepositry;
  export type Content = SchemaValue;
}
