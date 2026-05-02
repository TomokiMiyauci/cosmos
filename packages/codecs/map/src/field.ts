import type {
  CodecContext,
  Field,
  FieldCodec,
  MapNode,
  Node,
  Structure,
} from "@cosmos/core";

export class MapCodec implements FieldCodec {
  async parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<MapNode> {
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
        await ctx.codec.parse(structure[key]!, value, ctx),
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
