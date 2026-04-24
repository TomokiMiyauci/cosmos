import type { Codec, CodecContext, Field, Node, Structure } from "@cosmos/core";

export class MapField implements Codec {
  async parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<Node> {
    if (typeof structure === "string") throw new SyntaxError();
    if (field.type !== "map") throw new Error();

    const required = new Set(field.required);

    for (const key of required.values()) {
      if (!Reflect.has(structure, key)) {
        throw new Error(`${key} is required`);
      }
    }

    const promises = Object.entries(field.fields).filter(([key]) =>
      key in structure
    ).map(async ([key, value]) => {
      return [
        key,
        // Ensure by before prosess
        // deno-lint-ignore no-non-null-assertion
        await ctx.config.field.parse(structure[key]!, value, ctx),
      ];
    });

    const entreis = await Promise.all(promises);
    const value = Object.fromEntries(entreis);

    return {
      type: "map",
      value,
    };
  }

  stringify(_: Node): Structure | Promise<Structure> {
    throw new Error();
  }
}
