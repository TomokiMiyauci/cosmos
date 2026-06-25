import type {
  CodecContext,
  FieldCodec,
  Node,
  Schema,
  Structure,
  StructureObject,
  UnionNode,
} from "@cosmos/core";

export class UnionCodec implements FieldCodec {
  async parse(
    structure: Structure,
    schema: Schema,
    ctx: CodecContext,
  ): Promise<UnionNode> {
    if (schema.type !== "union") throw new Error();
    if (typeof structure === "string") throw new SyntaxError();

    const validateResult = validateUnionValue(structure);

    if (!validateResult) throw new SyntaxError();

    const { key, value } = structure;

    const childField = schema.variants[key];

    if (!childField) throw new Error();

    const node = await ctx.codec.parse(value, childField.schema, ctx);

    return {
      type: "union",
      key,
      value: node,
    };
  }

  async stringify(
    node: Node,
    schema: Schema,
    ctx: CodecContext,
  ): Promise<Structure> {
    if (node.type !== "union") throw new Error();
    if (schema.type !== "union") throw new Error();

    const childModel = schema.variants[node.key];

    if (!childModel) throw new Error();

    return {
      key: node.key,
      value: await ctx.codec.serialize(node.value, childModel.schema, ctx),
    };
  }
}

interface UnionValue extends StructureObject {
  key: string;
  value: Structure;
}

function validateUnionValue(
  structure: StructureObject,
): structure is UnionValue {
  return "key" in structure && typeof structure.key === "string";
}
