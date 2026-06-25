import type {
  CodecContext,
  FieldCodec,
  MapNode,
  Node,
  Schema,
  Structure,
} from "@cosmos/core";

export class MapCodec implements FieldCodec {
  async parse(
    structure: Structure,
    schema: Schema,
    ctx: CodecContext,
  ): Promise<MapNode> {
    if (typeof structure === "string") throw new SyntaxError();
    if (schema.type !== "map") throw new Error();

    const required = new Set(schema.required);

    for (const key of required.values()) {
      if (!Reflect.has(structure, key)) {
        throw new Error(`${key} is required`);
      }
    }

    const promises = Object.entries(schema.props).filter(([key]) =>
      key in structure
    ).map(async ([key, value]) => {
      return [
        key,
        // Ensure by before prosess
        // deno-lint-ignore no-non-null-assertion
        await ctx.codec.parse(structure[key]!, value.schema, ctx),
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
    schema: Schema,
    ctx: CodecContext,
  ): Promise<Structure> {
    if (node.type !== "map") throw new SyntaxError();
    if (schema.type !== "map") throw new SyntaxError();

    const promises = Object.entries(schema.props).filter(([key]) =>
      key in node.value
    ).map(async ([key, value]) => {
      return [
        key,
        // Ensure by before prosess
        // deno-lint-ignore no-non-null-assertion
        await ctx.codec.serialize(node.value[key]!, value.schema, ctx),
      ] as [string, Structure];
    });

    const entreis = await Promise.all(promises);
    const value = Object.fromEntries(entreis);

    return value;
  }
}
