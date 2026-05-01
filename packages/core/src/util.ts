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
    case "string": {
      structure = ctx.config.converters?.string?.standardize(structure, ctx) ??
        structure;
      return ctx.config.field.string.parse(structure, field, ctx);
    }
    case "number": {
      structure = ctx.config.converters?.number?.standardize(structure, ctx) ??
        structure;
      return ctx.config.field.number.parse(structure, field, ctx);
    }
    case "boolean": {
      structure = ctx.config.converters?.boolean?.standardize(structure, ctx) ??
        structure;
      return ctx.config.field.boolean.parse(structure, field, ctx);
    }
    case "map": {
      structure = ctx.config.converters?.map?.standardize(structure, ctx) ??
        structure;
      return ctx.config.field.map.parse(structure, field, ctx);
    }
    case "instance": {
      structure =
        ctx.config.converters?.instance?.standardize(structure, ctx) ??
          structure;
      return ctx.config.field.instance.parse(structure, field, ctx);
    }
    case "list": {
      structure = ctx.config.converters?.list?.standardize(structure, ctx) ??
        structure;
      return ctx.config.field.list.parse(structure, field, ctx);
    }
    case "asset": {
      structure = ctx.config.converters?.asset?.standardize(structure, ctx) ??
        structure;

      return ctx.config.field.asset.parse(structure, field, ctx);
    }
    case "datetime": {
      structure =
        ctx.config.converters?.datetime?.standardize(structure, ctx) ??
          structure;
      return ctx.config.field.datetime.parse(structure, field, ctx);
    }
    case "markdown": {
      structure =
        ctx.config.converters?.markdown?.standardize(structure, ctx) ??
          structure;
      return ctx.config.field.markdown.parse(structure, field, ctx);
    }
    case "union": {
      structure = ctx.config.converters?.union?.standardize(structure, ctx) ??
        structure;
      return ctx.config.field.union.parse(structure, field, ctx);
    }
    case "reference": {
      structure =
        ctx.config.converters?.reference?.standardize(structure, ctx) ??
          structure;
      return ctx.config.field.reference.parse(structure, field, ctx);
    }
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
