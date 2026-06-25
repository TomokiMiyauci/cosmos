import type {
  AssetNode,
  AssetSchema,
  BooleanNode,
  BooleanSchema,
  Codec,
  CodecContext,
  DatetimeNode,
  DatetimeSchema,
  ListNode,
  ListSchema,
  MapNode,
  MapSchema,
  Node,
  NumberNode,
  NumberSchema,
  ReferenceNode,
  ReferenceSchema,
  Schema,
  StringNode,
  StringSchema,
  Structure,
  UnionNode,
  UnionSchema,
} from "@cosmos/core";

export class ParentCodec implements Codec {
  constructor() {}
  parse(
    structure: Structure,
    field: StringSchema,
    ctx: CodecContext,
  ): StringNode | Promise<StringNode>;
  parse(
    structure: Structure,
    field: NumberSchema,
    ctx: CodecContext,
  ): NumberNode | Promise<NumberNode>;
  parse(
    structure: Structure,
    field: BooleanSchema,
    ctx: CodecContext,
  ): BooleanNode | Promise<BooleanNode>;
  parse(
    structure: Structure,
    field: AssetSchema,
    ctx: CodecContext,
  ): AssetNode | Promise<AssetNode>;
  parse(
    structure: Structure,
    field: DatetimeSchema,
    ctx: CodecContext,
  ): DatetimeNode | Promise<DatetimeNode>;
  parse(
    structure: Structure,
    field: ReferenceSchema,
    ctx: CodecContext,
  ): ReferenceNode | Promise<ReferenceNode>;
  parse(
    structure: Structure,
    field: ListSchema,
    ctx: CodecContext,
  ): ListNode | Promise<ListNode>;
  parse(
    structure: Structure,
    field: MapSchema,
    ctx: CodecContext,
  ): MapNode | Promise<MapNode>;
  parse(
    structure: Structure,
    field: UnionSchema,
    ctx: CodecContext,
  ): UnionNode | Promise<UnionNode>;
  parse(
    structure: Structure,
    field: Schema,
    ctx: CodecContext,
  ): Node | Promise<Node>;
  parse(
    structure: Structure,
    field: Schema,
    ctx: CodecContext,
  ): Node | Promise<Node> {
    const converters = ctx.config.converters;
    const fieldCodec = ctx.config.codec;

    switch (field.type) {
      case "string": {
        structure = converters?.string?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.string.parse(structure, field, ctx);
      }
      case "number": {
        structure = converters?.number?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.number.parse(structure, field, ctx);
      }
      case "boolean": {
        structure = converters?.boolean?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.boolean.parse(structure, field, ctx);
      }
      case "map": {
        structure = converters?.map?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.map.parse(structure, field, ctx);
      }
      case "instance": {
        structure = converters?.instance?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.instance.parse(structure, field, ctx);
      }
      case "list": {
        structure = converters?.list?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.list.parse(structure, field, ctx);
      }
      case "asset": {
        structure = converters?.asset?.standardize(structure, ctx) ??
          structure;

        return fieldCodec.asset.parse(structure, field, ctx);
      }
      case "datetime": {
        structure = converters?.datetime?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.datetime.parse(structure, field, ctx);
      }
      case "markdown": {
        structure = converters?.markdown?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.markdown.parse(structure, field, ctx);
      }
      case "union": {
        structure = converters?.union?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.union.parse(structure, field, ctx);
      }
      case "reference": {
        structure = converters?.reference?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.reference.parse(structure, field, ctx);
      }
    }
  }

  serialize(
    node: Node,
    field: Schema,
    ctx: CodecContext,
  ): Structure | Promise<Structure> {
    const fieldCodec = ctx.config.codec;

    switch (field.type) {
      case "string": {
        return fieldCodec.string.stringify(node, field, ctx);
      }
      case "number": {
        return fieldCodec.number.stringify(node, field, ctx);
      }
      case "boolean": {
        return fieldCodec.boolean.stringify(node, field, ctx);
      }
      case "asset":
      case "datetime": {
        return fieldCodec.datetime.stringify(node, field, ctx);
      }
      case "reference": {
        return fieldCodec.reference.stringify(node, field, ctx);
      }
      case "list": {
        return fieldCodec.list.stringify(node, field, ctx);
      }
      case "map": {
        return fieldCodec.map.stringify(node, field, ctx);
      }
      case "union": {
        return fieldCodec.union.stringify(node, field, ctx);
      }
      case "markdown": {
        return fieldCodec.markdown.stringify(node, field, ctx);
      }
      case "instance": {
        return fieldCodec.instance.stringify(node, field, ctx);
      }
    }
  }
}
