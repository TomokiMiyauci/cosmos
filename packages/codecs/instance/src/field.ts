import type {
  CodecContext,
  FieldCodec,
  Node,
  Schema,
  Structure,
} from "@cosmos/core";

export class InstanceCodec implements FieldCodec {
  parse(
    structure: Structure,
    schema: Schema,
    ctx: CodecContext,
  ): Promise<Node> | Node {
    if (schema.type !== "instance") throw new Error();

    const childModel = ctx.engine.models[schema.model];

    if (!childModel) throw new Error();

    return ctx.codec.parse(structure, childModel.schema, ctx);
  }

  stringify(
    node: Node,
    schema: Schema,
    ctx: CodecContext,
  ): Structure | Promise<Structure> {
    if (schema.type !== "instance") throw new Error();

    const model = ctx.engine.models[schema.model];

    if (!model) throw new Error();

    return ctx.codec.serialize(node, model.schema, ctx);
  }
}
