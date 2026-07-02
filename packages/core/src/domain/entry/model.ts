import type { Node } from "../../types/node.ts";
import type { EntryId } from "./id.ts";

export class Entry {
  private constructor(id: EntryId, node: Node) {
    this.#id = id;
    this.#node = node;
  }
  readonly #id: EntryId;
  readonly #node: Node;

  static of(id: EntryId, node: Node): Entry {
    return new Entry(id, node);
  }

  get id(): EntryId {
    return this.#id;
  }

  get node(): Node {
    return this.#node;
  }
}
