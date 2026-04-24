import type {
  Codec,
  CodecContext,
  Field,
  ListNode,
  Node,
  Structure,
  StructureObject,
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
        return ctx.config.field.parse(value, field.field, ctx);
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
      const childValue = await ctx.config.field.stringify(
        child,
        field.field,
        ctx,
      );

      structure[key.toString()] = childValue;
    }

    return structure;
  }
}
