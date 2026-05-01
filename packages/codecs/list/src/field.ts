import {
  type Codec,
  type CodecContext,
  type Field,
  type ListNode,
  type Node,
  parseField,
  type Structure,
  type StructureObject,
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

export class ListField implements Codec {
  async parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Promise<ListNode> {
    if (typeof structure === "string") throw new Error();

    if (field.type !== "list") throw new Error();

    const values = Object.values(structure);

    const promise = values.map(
      (value) => {
        return parseField(value, field.field, ctx);
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
    field: Field,
    ctx: CodecContext,
  ): Promise<StructureObject> {
    if (node.type !== "list") throw new Error();
    if (field.type !== "list") throw new Error();

    const structure: StructureObject = {};

    for (const [key, child] of node.value.entries()) {
      const childValue = await stringifyField(
        child,
        field.field,
        ctx,
      );

      structure[key.toString()] = childValue;
    }

    return structure;
  }
}

export function stringifyField(
  node: Node,
  field: Field,
  ctx: CodecContext,
): Promise<Structure> | Structure {
  switch (field.type) {
    case "string": {
      assertStringNode(node);
      return ctx.config.field.string.stringify(node, field, ctx);
    }
    case "number": {
      assertNumberNode(node);
      return ctx.config.field.number.stringify(node, field, ctx);
    }
    case "boolean": {
      assertBooleanNode(node);
      return ctx.config.field.boolean.stringify(node, field, ctx);
    }
    case "map": {
      assertMapNode(node);
      return ctx.config.field.map.stringify(node, field, ctx);
    }
    case "instance":
      return ctx.config.field.instance.stringify(node, field, ctx);
    case "list": {
      assertListNode(node);
      return ctx.config.field.list.stringify(node, field, ctx);
    }
    case "asset": {
      assertAssertNode(node);
      return ctx.config.field.asset.stringify(node, field, ctx);
    }
    case "datetime": {
      assertDatetimeNode(node);
      return ctx.config.field.datetime.stringify(node, field, ctx);
    }
    case "markdown": {
      assertMarkdownNode(node);
      return ctx.config.field.markdown.stringify(node, field, ctx);
    }
    case "union": {
      assertUnionNode(node);
      return ctx.config.field.union.stringify(node, field, ctx);
    }
    case "reference": {
      assertReferenceNode(node);
      return ctx.config.field.reference.stringify(node, field, ctx);
    }
  }
}
