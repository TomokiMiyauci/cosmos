import type {
  DatetimeNode,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";
import type { FieldCodec } from "@cosmos/config";

export class DatetimeCodec implements FieldCodec {
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
