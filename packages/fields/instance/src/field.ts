import type {
  Field,
  FieldCodec,
  FieldContext,
  Node,
  StructureValue,
} from "@cosmos/core";

export class InstanceField implements FieldCodec {
  async parse(
    structure: StructureValue,
    field: Field,
    ctx: FieldContext,
  ): Promise<Node> {
    if (typeof structure === "string") throw new Error();

    if (field.type !== "map") throw new Error();

    const model = ctx.config.models.find((model) => model.name === field.to);

    if (!model) throw new Error();

    const promises = model.fields.filter((field) => field.name in structure)
      .map(
        async (field) => {
          const key = field.name;
          const value = structure[key];

          return [
            key,
            await ctx.config.field.parse(value, field, ctx),
          ] as const;
        },
      );
    const entries = await Promise.all(promises);
    const value = Object.fromEntries(entries);

    return {
      type: "map",
      value,
    };
  }

  stringify(node: Node): StructureValue | Promise<StructureValue> {
    throw new Error();
  }
}
