import type {
  ListNode,
  Node,
  Schema,
  Structure,
  StructureObject,
} from "@cosmos/core";
import type { FieldCodec, FieldCodecContext } from "@cosmos/config";

export class ListCodec implements FieldCodec {
  async parse(
    structure: Structure,
    schema: Schema,
    ctx: FieldCodecContext,
  ): Promise<ListNode> {
    if (typeof structure === "string") throw new Error();

    if (schema.type !== "list") throw new Error();

    const values = Object.values(structure);

    const promise = values.map(
      (value) => {
        return ctx.codec.parse(value, schema.item, ctx);
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
    schema: Schema,
    ctx: FieldCodecContext,
  ): Promise<StructureObject> {
    if (node.type !== "list") throw new Error();
    if (schema.type !== "list") throw new Error();

    const structure: StructureObject = {};

    for (const [key, child] of node.value.entries()) {
      const childValue = await ctx.codec.serialize(
        child,
        schema.item,
        ctx,
      );

      structure[key.toString()] = childValue;
    }

    return structure;
  }
}
