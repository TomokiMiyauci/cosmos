import type {
  Codec,
  CodecContext,
  Field,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";

export class UnionField implements Codec {
  async parse(
    structure: StructureValue,
    field: Field,
    ctx: CodecContext,
  ): Promise<Node> {
    if (field.type !== "union") throw new Error();
    if (typeof structure === "string") throw new SyntaxError();

    const validateResult = validateUnionValue(structure);

    if (!validateResult) throw new SyntaxError();

    const { key, value } = structure;

    const childField = field.fields[key];

    if (!childField) throw new Error();

    const node = await ctx.config.field.parse(value, childField, ctx);

    return {
      type: "union",
      key,
      value: node,
    };
  }

  stringify(node: Node): StructureValue | Promise<StructureValue> {
    throw new Error();
  }
}

interface UnionValue extends Structure {
  key: string;
  value: StructureValue;
}

function validateUnionValue(structure: Structure): structure is UnionValue {
  return "key" in structure && typeof structure.key === "string";
}
