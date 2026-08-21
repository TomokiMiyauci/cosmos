import type { Node } from "./node.ts";
import type { EntryId } from "./id.ts";
import type { ModelId } from "../model/id.ts";

export class Entry {
  private constructor(
    id: EntryId,
    modelId: ModelId,
    node: Node,
  ) {
    this.#id = id;
    this.#node = node;
    this.#modelId = modelId;
  }
  readonly #id: EntryId;
  readonly #node: Node;
  readonly #modelId: ModelId;

  static of(
    id: EntryId,
    modelId: ModelId,
    node: Node,
  ): Entry {
    return new Entry(id, modelId, node);
  }

  get id(): EntryId {
    return this.#id;
  }

  get node(): Node {
    return this.#node;
  }

  get modelId(): ModelId {
    return this.#modelId;
  }
}
