import type {
  CodecContext,
  FieldCodec,
  ListNode,
  Model,
  Node,
  Structure,
  StructureObject,
} from "@cosmos/core";
import {
  assertAssertNode,
  assertBooleanNode,
  assertDatetimeNode,
  assertListNode,
  assertMapNode,
  assertMarkdownNode,
  assertNumberNode,
  assertReferenceNode,
  assertStringNode,
  assertUnionNode,
} from "@cosmos/node-validator";

export class ListCodec implements FieldCodec {
  async parse(
    structure: Structure,
    field: Model,
    ctx: CodecContext,
  ): Promise<ListNode> {
    if (typeof structure === "string") throw new Error();

    if (field.type !== "list") throw new Error();

    const values = Object.values(structure);

    const promise = values.map(
      (value) => {
        return ctx.codec.parse(value, field.item, ctx);
      },
    );

    const value = await Promise.all(promise);

    return {
      type: "list",
      value,
    };
  }

  async stringify(
    node: Node,
    field: Model,
    ctx: CodecContext,
  ): Promise<StructureObject> {
    if (node.type !== "list") throw new Error();
    if (field.type !== "list") throw new Error();

    const structure: StructureObject = {};

    for (const [key, child] of node.value.entries()) {
      const childValue = await stringifyField(
        child,
        field.item,
        ctx,
      );

      structure[key.toString()] = childValue;
    }

    return structure;
  }
}

export function stringifyField(
  node: Node,
  field: Model,
  ctx: CodecContext,
): Promise<Structure> | Structure {
  switch (field.type) {
    case "string": {
      assertStringNode(node);
      return ctx.config.codec.string.stringify(node, field, ctx);
    }
    case "number": {
      assertNumberNode(node);
      return ctx.config.codec.number.stringify(node, field, ctx);
    }
    case "boolean": {
      assertBooleanNode(node);
      return ctx.config.codec.boolean.stringify(node, field, ctx);
    }
    case "map": {
      assertMapNode(node);
      return ctx.config.codec.map.stringify(node, field, ctx);
    }
    case "instance":
      return ctx.config.codec.instance.stringify(node, field, ctx);
    case "list": {
      assertListNode(node);
      return ctx.config.codec.list.stringify(node, field, ctx);
    }
    case "asset": {
      assertAssertNode(node);
      return ctx.config.codec.asset.stringify(node, field, ctx);
    }
    case "datetime": {
      assertDatetimeNode(node);
      return ctx.config.codec.datetime.stringify(node, field, ctx);
    }
    case "markdown": {
      assertMarkdownNode(node);
      return ctx.config.codec.markdown.stringify(node, field, ctx);
    }
    case "union": {
      assertUnionNode(node);
      return ctx.config.codec.union.stringify(node, field, ctx);
    }
    case "reference": {
      assertReferenceNode(node);
      return ctx.config.codec.reference.stringify(node, field, ctx);
    }
  }
}
