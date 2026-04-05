import type {
  Field,
  FieldCodec,
  FieldContext,
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

  stringify(node: Node): StructureValue | Promise<StructureValue> {
    throw new Error();
  }
}
