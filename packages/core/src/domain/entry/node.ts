import { Result } from "@miyauci/util";
import type { EntryId } from "./id.ts";

export type Node =
  | LiteralNode
  | StringNode
  | NumberNode
  | BooleanNode
  | MapNode
  | ListNode
  | UnionNode
  | ReferenceNode
  | TemporalNode;

export class LiteralNode {
  #value: string;

  type = "literal" as const;
  private constructor(value: string) {
    this.#value = value;
  }
  static of(value: string): LiteralNode {
    return new LiteralNode(value);
  }

  get value(): string {
    return this.#value;
  }
}

export class StringNode {
  #value: string;

  private constructor(value: string) {
    this.#value = value;
  }

  static of(value: string): StringNode {
    return new StringNode(value);
  }

  readonly type = "string";

  get value(): string {
    return this.#value;
  }
}

export class NumberNode {
  #value: number;

  private constructor(value: number) {
    this.#value = value;
  }

  readonly type = "number";

  static of(value: number): Result<NumberNode, SyntaxError> {
    if (isNaN(value)) {
      return Result.error(new SyntaxError());
    }

    return Result.ok(new NumberNode(value));
  }

  get value(): number {
    return this.#value;
  }
}

export class BooleanNode {
  #value: boolean;

  private constructor(value: boolean) {
    this.#value = value;
  }

  readonly type = "boolean";

  static of(value: boolean): BooleanNode {
    return new BooleanNode(value);
  }

  get value(): boolean {
    return this.#value;
  }
}

export class MapNode {
  #value: Record<string, Node>;

  constructor(value: Record<string, Node>) {
    this.#value = value;
  }

  readonly type = "map";

  get value(): Record<string, Node> {
    return this.#value;
  }
}

export class ListNode {
  #value: Node[];

  constructor(value: Node[]) {
    this.#value = value;
  }

  readonly type = "list";

  get value(): Node[] {
    return this.#value;
  }
}

export class UnionNode {
  #value: Node;

  constructor(value: Node) {
    this.#value = value;
  }

  readonly type = "union";

  get value(): Node {
    return this.#value;
  }
}

export class ReferenceNode {
  #value: EntryId;

  private constructor(value: EntryId) {
    this.#value = value;
  }

  static of(value: EntryId): ReferenceNode {
    return new ReferenceNode(value);
  }

  readonly type = "reference";

  get value(): EntryId {
    return this.#value;
  }
}

export class TemporalNode {
  #value: Date;

  private constructor(value: Date) {
    this.#value = value;
  }

  static of(value: Date): Result<TemporalNode, SyntaxError> {
    if (isNaN(value.getDate())) {
      return Result.error(new SyntaxError());
    }

    return Result.ok(new TemporalNode(value));
  }

  readonly type = "temporal";

  get value(): Date {
    return this.#value;
  }
}

export function* collectReferences(node: Node): Generator<EntryId> {
  switch (node.type) {
    case "string":
    case "number":
    case "boolean":
    case "temporal":
    case "literal": {
      break;
    }
    case "map": {
      for (const childNode of Object.values(node.value)) {
        yield* collectReferences(childNode);
      }
      break;
    }
    case "list": {
      for (const childNode of node.value) {
        yield* collectReferences(childNode);
      }
      break;
    }
    case "union": {
      yield* collectReferences(node.value);
      break;
    }
    case "reference": {
      yield node.value;
      break;
    }
  }
}
