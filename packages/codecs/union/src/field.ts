import {
  type Codec,
  type CodecContext,
  type Field,
  type Node,
  parseField,
  type Structure,
  type StructureObject,
  type UnionNode,
} from "@cosmos/core";

export class UnionField implements Codec {
  async parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<UnionNode> {
    if (field.type !== "union") throw new Error();
    if (typeof structure === "string") throw new SyntaxError();

    const validateResult = validateUnionValue(structure);

    if (!validateResult) throw new SyntaxError();

    const { key, value } = structure;

    const childField = field.fields[key];

    if (!childField) throw new Error();

    const node = await parseField(value, childField, ctx);

    return {
      type: "union",
      key,
      value: node,
    };
  }

  stringify(node: Node): Structure | Promise<Structure> {
    throw new Error();
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
