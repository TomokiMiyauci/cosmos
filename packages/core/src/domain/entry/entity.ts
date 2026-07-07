import type { Node } from "../../types/node.ts";
import type { EntryId } from "./id.ts";
import type { EntryName } from "./name.ts";
import type { ModelId } from "../model/id.ts";

export class Entry {
  private constructor(
    id: EntryId,
    name: EntryName,
    model: ModelId,
    node: Node,
  ) {
    this.#id = id;
    this.#node = node;
    this.#name = name;
    this.#model = model;
  }
  readonly #id: EntryId;
  readonly #node: Node;
  readonly #name: EntryName;
  readonly #model: ModelId;

  static of(
    id: EntryId,
    name: EntryName,
    model: ModelId,
    node: Node,
  ): Entry {
    return new Entry(id, name, model, node);
  }

  get id(): EntryId {
    return this.#id;
  }

  get name(): EntryName {
    return this.#name;
  }

  get node(): Node {
    return this.#node;
  }

  get modelId(): ModelId {
    return this.#model;
  }
}
