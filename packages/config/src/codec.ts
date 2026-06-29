import type {
  AssetNode,
  AssetSchema,
  BooleanNode,
  BooleanSchema,
  Codec,
  CodecContext,
  DatetimeNode,
  DatetimeSchema,
  InstanceSchema,
  ListNode,
  ListSchema,
  MapNode,
  MapSchema,
  MarkdownNode,
  MarkdownSchema,
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
  constructor(private map: CodecMap) {}

  parse(
    structure: Structure,
    field: Schema,
    ctx: CodecContext,
  ): Node | Promise<Node> {
    const converters = ctx.engine.converters;
    const fieldCodec = this.map;
    const context = { ...ctx, codec: this } satisfies FieldCodecContext;

    switch (field.type) {
      case "string": {
        structure = converters?.string?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.string.parse(structure, field, context);
      }
      case "number": {
        structure = converters?.number?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.number.parse(structure, field, context);
      }
      case "boolean": {
        structure = converters?.boolean?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.boolean.parse(structure, field, context);
      }
      case "map": {
        structure = converters?.map?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.map.parse(structure, field, context);
      }
      case "instance": {
        structure = converters?.instance?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.instance.parse(structure, field, context);
      }
      case "list": {
        structure = converters?.list?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.list.parse(structure, field, context);
      }
      case "asset": {
        structure = converters?.asset?.standardize(structure, ctx) ??
          structure;

        return fieldCodec.asset.parse(structure, field, context);
      }
      case "datetime": {
        structure = converters?.datetime?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.datetime.parse(structure, field, context);
      }
      case "markdown": {
        structure = converters?.markdown?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.markdown.parse(structure, field, context);
      }
      case "union": {
        structure = converters?.union?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.union.parse(structure, field, context);
      }
      case "reference": {
        structure = converters?.reference?.standardize(structure, ctx) ??
          structure;
        return fieldCodec.reference.parse(structure, field, context);
      }
    }
  }

  serialize(
    node: Node,
    field: Schema,
    ctx: CodecContext,
  ): Structure | Promise<Structure> {
    const fieldCodec = this.map;
    const context = { ...ctx, codec: this } satisfies FieldCodecContext;

    switch (field.type) {
      case "string": {
        return fieldCodec.string.stringify(node, field, context);
      }
      case "number": {
        return fieldCodec.number.stringify(node, field, context);
      }
      case "boolean": {
        return fieldCodec.boolean.stringify(node, field, context);
      }
      case "asset": {
        return fieldCodec.asset.stringify(node, field, context);
      }
      case "datetime": {
        return fieldCodec.datetime.stringify(node, field, context);
      }
      case "reference": {
        return fieldCodec.reference.stringify(node, field, context);
      }
      case "list": {
        return fieldCodec.list.stringify(node, field, context);
      }
      case "map": {
        return fieldCodec.map.stringify(node, field, context);
      }
      case "union": {
        return fieldCodec.union.stringify(node, field, context);
      }
      case "markdown": {
        return fieldCodec.markdown.stringify(node, field, context);
      }
      case "instance": {
        return fieldCodec.instance.stringify(node, field, context);
      }
    }
  }
}

export interface FieldCodecContext extends CodecContext {
  codec: Codec;
}

export interface FieldCodec<T extends Schema = Schema, U extends Node = Node> {
  parse(
    structure: Structure,
    model: T,
    ctx: FieldCodecContext,
  ): U | Promise<U>;

  stringify(
    node: U,
    model: T,
    ctx: FieldCodecContext,
  ): Structure | Promise<Structure>;
}

export interface CodecMap {
  string: FieldCodec<StringSchema, StringNode>;
  asset: FieldCodec<AssetSchema, AssetNode>;
  map: FieldCodec<MapSchema, MapNode>;
  boolean: FieldCodec<BooleanSchema, BooleanNode>;
  number: FieldCodec<NumberSchema, NumberNode>;
  instance: FieldCodec<InstanceSchema>;
  list: FieldCodec<ListSchema, ListNode>;
  markdown: FieldCodec<MarkdownSchema, MarkdownNode>;
  reference: FieldCodec<ReferenceSchema, ReferenceNode>;
  datetime: FieldCodec<DatetimeSchema, DatetimeNode>;
  union: FieldCodec<UnionSchema, UnionNode>;
}
