import {
  type Codec,
  type CodecContext,
  type Field,
  type Node,
  parseField,
  type Structure,
} from "@cosmos/core";

export class InstanceField implements Codec {
  parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<Node> | Node {
    if (field.type !== "instance") throw new Error();

    const model = ctx.config.models[field.model];

    if (!model) throw new Error();

    return parseField(structure, model, ctx);
  }

  stringify(node: Node): Structure | Promise<Structure> {
    throw new Error();
  }
}
