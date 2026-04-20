import type {
  Codec,
  CodecContext,
  Field,
  Node,
  StructureValue,
} from "@cosmos/core";

export class InstanceField implements Codec {
  parse(
    structure: StructureValue,
    field: Field,
    ctx: CodecContext,
  ): Promise<Node> | Node {
    if (field.type !== "instance") throw new Error();

    const model = ctx.config.models[field.model];

    if (!model) throw new Error();

    return ctx.config.field.parse(structure, model, ctx);
  }

  stringify(node: Node): StructureValue | Promise<StructureValue> {
    throw new Error();
  }
}
