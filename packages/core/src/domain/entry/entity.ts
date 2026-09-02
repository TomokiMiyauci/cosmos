// deno-lint-ignore-file no-namespace
import { EntryId } from "./id.ts";
import type { EntryRepositry } from "./repositry.ts";
import type { ModelId } from "../model/id.ts";
import { EntryContent, FiniteNumber as _FiniteNumber } from "./content.ts";

export class Entry {
  private constructor(id: EntryId, modelId: ModelId, content: EntryContent) {
    this.#id = id;
    this.#modelId = modelId;
    this.#content = content;
  }
  readonly #id: EntryId;
  readonly #modelId: ModelId;
  readonly #content: EntryContent;

  static of(
    id: EntryId,
    modelId: ModelId,
    content: EntryContent,
  ): Entry {
    return new Entry(id, modelId, content);
  }

  get id(): EntryId {
    return this.#id;
  }

  get modelId(): ModelId {
    return this.#modelId;
  }

  get content(): EntryContent {
    return this.#content;
  }
}

export namespace Entry {
  export const Id = EntryId;
  export type Id = EntryId;
  export type Repositry = EntryRepositry;
  export type Content = EntryContent;

  export namespace Content {
    export const of = EntryContent.of;
    export const FiniteNumber = _FiniteNumber;
  }
}
