import {
  type Codec,
  type CodecContext,
  type Field,
  type ListNode,
  type Node,
  parseField,
  stringifyField,
  type Structure,
  type StructureObject,
} from "@cosmos/core";

export class ListField implements Codec {
  async parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<ListNode> {
    if (typeof structure === "string") throw new Error();

    if (field.type !== "list") throw new Error();

    const values = Object.values(structure);

    const promise = values.map(
      (value) => {
        return parseField(value, field.field, ctx);
      },
    );

    const value = await Promise.all(promise);

    return {
      type: "list",
      value,
    };
  }

  async stringify(
    node: Node,
    field: Field,
    ctx: CodecContext,
  ): Promise<StructureObject> {
    if (node.type !== "list") throw new Error();
    if (field.type !== "list") throw new Error();

    const structure: StructureObject = {};

    for (const [key, child] of node.value.entries()) {
      const childValue = await stringifyField(
        child,
        field.field,
        ctx,
      );

      structure[key.toString()] = childValue;
    }

    return structure;
  }
}
