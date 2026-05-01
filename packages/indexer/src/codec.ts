import type {
  AssetField,
  AssetNode,
  BooleanField,
  BooleanNode,
  Codec,
  CodecContext,
  DatetimeField,
  DatetimeNode,
  Field,
  ListField,
  ListNode,
  MapField,
  MapNode,
  Node,
  NumberField,
  NumberNode,
  ReferenceField,
  ReferenceNode,
  StringField,
  StringNode,
  Structure,
  UnionField,
  UnionNode,
} from "@cosmos/core";

export class ParentCodec implements Codec {
  constructor() {}
  parse(
    structure: Structure,
    field: StringField,
    ctx: CodecContext,
  ): StringNode | Promise<StringNode>;
  parse(
    structure: Structure,
    field: NumberField,
    ctx: CodecContext,
  ): NumberNode | Promise<NumberNode>;
  parse(
    structure: Structure,
    field: BooleanField,
    ctx: CodecContext,
  ): BooleanNode | Promise<BooleanNode>;
  parse(
    structure: Structure,
    field: AssetField,
    ctx: CodecContext,
  ): AssetNode | Promise<AssetNode>;
  parse(
    structure: Structure,
    field: DatetimeField,
    ctx: CodecContext,
  ): DatetimeNode | Promise<DatetimeNode>;
  parse(
    structure: Structure,
    field: ReferenceField,
    ctx: CodecContext,
  ): ReferenceNode | Promise<ReferenceNode>;
  parse(
    structure: Structure,
    field: ListField,
    ctx: CodecContext,
  ): ListNode | Promise<ListNode>;
  parse(
    structure: Structure,
    field: MapField,
    ctx: CodecContext,
  ): MapNode | Promise<MapNode>;
  parse(
    structure: Structure,
    field: UnionField,
    ctx: CodecContext,
  ): UnionNode | Promise<UnionNode>;
  parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Node | Promise<Node>;
  parse(
    structure: Structure,
    field: Field,
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
}
