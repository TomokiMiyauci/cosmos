import type {
  CodecContext,
  Field,
  Formatter,
  FormatterDefinitionBase,
  Node,
  Structure,
} from "./type.ts";

export function parseField(
  structure: Structure,
  field: Field,
  ctx: CodecContext,
): Promise<Node> | Node {
  switch (field.type) {
    case "string":
      return ctx.config.field.string.parse(structure, field, ctx);
    case "number":
      return ctx.config.field.number.parse(structure, field, ctx);
    case "boolean":
      return ctx.config.field.boolean.parse(structure, field, ctx);
    case "map":
      return ctx.config.field.map.parse(structure, field, ctx);
    case "instance":
      return ctx.config.field.instance.parse(structure, field, ctx);
    case "list":
      return ctx.config.field.list.parse(structure, field, ctx);
    case "asset":
      return ctx.config.field.asset.parse(structure, field, ctx);
    case "datetime":
      return ctx.config.field.datetime.parse(structure, field, ctx);
    case "markdown":
      return ctx.config.field.markdown.parse(structure, field, ctx);
    case "union":
      return ctx.config.field.union.parse(structure, field, ctx);
    case "reference":
      return ctx.config.field.reference.parse(structure, field, ctx);
  }
}

export function stringifyField(
  node: Node,
  field: Field,
  ctx: CodecContext,
): Promise<Structure> | Structure {
  switch (node.type) {
    case "string":
      return ctx.config.field.string.stringify(node, field, ctx);
    case "number":
      return ctx.config.field.number.stringify(node, field, ctx);
    case "boolean":
      return ctx.config.field.boolean.stringify(node, field, ctx);
    case "map":
      return ctx.config.field.map.stringify(node, field, ctx);
    // case "instance":
    //   return ctx.config.field.instance.stringify(node, field, ctx);
    case "list":
      return ctx.config.field.list.stringify(node, field, ctx);
    case "asset":
      return ctx.config.field.asset.stringify(node, field, ctx);
    case "datetime":
      return ctx.config.field.datetime.stringify(node, field, ctx);
    case "markdown":
      return ctx.config.field.markdown.stringify(node, field, ctx);
    case "union":
      return ctx.config.field.union.stringify(node, field, ctx);
    case "reference":
      return ctx.config.field.reference.stringify(node, field, ctx);
  }
}

export function resolveFormatter(
  format: FormatterDefinitionBase<string>,
  map: FormatterMap,
): Formatter {
  const formatter = map[format.type];

  if (!formatter) throw new Error("unknown formatter");

  return formatter;
}

export interface FormatterMap {
  [type: string]: Formatter;
}
