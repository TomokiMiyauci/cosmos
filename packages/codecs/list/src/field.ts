import type { Codec, CodecContext, Field, Node, Structure } from "@cosmos/core";

export class ListField implements Codec {
  async parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<Node> {
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

  stringify(_: Node): Structure | Promise<Structure> {
    throw new Error();
  }
}
