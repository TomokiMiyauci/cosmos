import type {
  CodecContext,
  Field,
  FieldCodec,
  Node,
  Structure,
} from "@cosmos/core";

export class InstanceCodec implements FieldCodec {
  parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<Node> | Node {
    if (field.type !== "instance") throw new Error();

    const model = ctx.config.models[field.model];

    if (!model) throw new Error();

    return ctx.codec.parse(structure, model, ctx);
  }

  stringify(): Structure | Promise<Structure> {
    throw new Error();
  }
}
