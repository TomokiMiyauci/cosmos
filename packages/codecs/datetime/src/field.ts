import type {
  Codec,
  DatetimeNode,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";

export class DatetimeCodec implements Codec {
  parse(structure: Structure): DatetimeNode {
    if (typeof structure !== "string") throw new SyntaxError();

    return {
      type: "datetime",
      value: new Date(structure),
    };
  }

  stringify(node: Node): StructureValue {
    if (node.type !== "datetime") throw new Error();

    return node.value.toISOString();
  }
}
