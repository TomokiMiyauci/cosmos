import type {
  Field,
  FieldCodec,
  FieldContext,
  Node,
  StructureValue,
} from "@cosmos/core";

export class MapField implements FieldCodec {
  async parse(
    structure: StructureValue,
    field: Field,
    ctx: FieldContext,
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

  stringify(node: Node): StructureValue | Promise<StructureValue> {
    throw new Error();
  }
}
