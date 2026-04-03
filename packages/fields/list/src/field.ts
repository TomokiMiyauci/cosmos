import type {
  Field,
  FieldCodec,
  FieldContext,
  MapNode,
  Node,
  StructureValue,
} from "@cosmos/core";

export class ListField implements FieldCodec {
  async parse(
    structure: StructureValue,
    field: Field,
    ctx: FieldContext,
  ): Promise<Node> {
    if (typeof structure === "string") throw new Error();

    if (field.type !== "list") throw new Error();

    const model = ctx.config.models.find((model) => model.name === field.to);

    if (!model) throw new Error();

    const values = Object.values(structure);

    const promise = values.filter((value) => typeof value !== "string").map(
      async (value) => {
        const promise = model.fields.filter((field) => field.name in value).map(
          async (field) => {
            const child = value[field.name];

            return [
              field.name,
              await ctx.config.field.parse(child, field, ctx),
            ] as const;
          },
        );

        const entries = await Promise.all(promise);

        const map = Object.fromEntries(entries);

        return {
          type: "map",
          value: map,
        } satisfies MapNode;
      },
    );

    const value = await Promise.all(promise);

    return {
      type: "list",
      value,
    };
  }

  stringify(node: Node): StructureValue | Promise<StructureValue> {
    throw new Error();
  }
}
