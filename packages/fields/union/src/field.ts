import type {
  Field,
  FieldCodec,
  FieldContext,
  Node,
  StructureValue,
} from "@cosmos/core";

export class UnionField implements FieldCodec {
  parse(
    structure: StructureValue,
    field: Field,
    ctx: FieldContext,
  ): Promise<Node> | Node {
    if (field.type !== "union") throw new Error();

    for (const childField of field.fields) {
      try {
        return ctx.config.field.parse(structure, childField, ctx);
      } catch {
        // noop
      }
    }

    throw new SyntaxError();
  }

  stringify(node: Node): StructureValue | Promise<StructureValue> {
    throw new Error();
  }
}
