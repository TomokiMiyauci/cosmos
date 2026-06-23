import type {
  CodecContext,
  FieldCodec,
  MapNode,
  Model,
  Node,
  Structure,
} from "@cosmos/core";

export class MapCodec implements FieldCodec {
  async parse(
    structure: Structure,
    model: Model,
    ctx: CodecContext,
  ): Promise<MapNode> {
    if (typeof structure === "string") throw new SyntaxError();
    if (model.type !== "map") throw new Error();

    const required = new Set(model.required);

    for (const key of required.values()) {
      if (!Reflect.has(structure, key)) {
        throw new Error(`${key} is required`);
      }
    }

    const promises = Object.entries(model.props).filter(([key]) =>
      key in structure
    ).map(async ([key, value]) => {
      return [
        key,
        // Ensure by before prosess
        // deno-lint-ignore no-non-null-assertion
        await ctx.codec.parse(structure[key]!, value, ctx),
      ] as [string, Node];
    });

    const entreis = await Promise.all(promises);
    const value = Object.fromEntries(entreis);

    return {
      type: "map",
      value,
    };
  }

  async stringify(
    node: Node,
    model: Model,
    ctx: CodecContext,
  ): Promise<Structure> {
    if (node.type !== "map") throw new SyntaxError();
    if (model.type !== "map") throw new SyntaxError();

    const promises = Object.entries(model.props).filter(([key]) =>
      key in node.value
    ).map(async ([key, value]) => {
      return [
        key,
        // Ensure by before prosess
        // deno-lint-ignore no-non-null-assertion
        await ctx.codec.serialize(node.value[key]!, value, ctx),
      ] as [string, Structure];
    });

    const entreis = await Promise.all(promises);
    const value = Object.fromEntries(entreis);

    return value;
  }
}
