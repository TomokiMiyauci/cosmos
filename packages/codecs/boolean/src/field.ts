import type {
  BooleanNode,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";
import { createBooleanNode } from "@cosmos/node-builder";
import type { FieldCodec } from "@cosmos/config";

export class BooleanCodec implements FieldCodec {
  parse(structure: Structure): BooleanNode {
    if (typeof structure !== "string") throw new SyntaxError();
    if (structure !== "true" && structure !== "false") {
      throw new SyntaxError("Invalid boolean value");
    }

    const node = createBooleanNode(structure === "true" ? true : false);

    return node;
  }

  stringify(node: Node): StructureValue {
    if (node.type !== "boolean") throw new TypeError();

    return node.value ? "true" : "false";
  }
}
