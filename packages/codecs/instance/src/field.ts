import type {
  CodecContext,
  FieldCodec,
  Model,
  Node,
  Structure,
} from "@cosmos/core";

export class InstanceCodec implements FieldCodec {
  parse(
    structure: Structure,
    model: Model,
    ctx: CodecContext,
  ): Promise<Node> | Node {
    if (model.type !== "instance") throw new Error();

    const childModel = ctx.config.models[model.model];

    if (!childModel) throw new Error();

    return ctx.codec.parse(structure, childModel, ctx);
  }

  stringify(
    node: Node,
    field: Model,
    ctx: CodecContext,
  ): Structure | Promise<Structure> {
    if (field.type !== "instance") throw new Error();

    const model = ctx.config.models[field.model];

    if (!model) throw new Error();

    return ctx.codec.serialize(node, model, ctx);
  }
}
