import type { Codec, CodecContext, Field, Node, Structure } from "@cosmos/core";

export interface CodecMap {
  string: Codec;
  number: Codec;
  boolean: Codec;
  map: Codec;
  instance: Codec;
  reference: Codec;
  list: Codec;
  datetime: Codec;
  markdown: Codec;
  asset: Codec;
  union: Codec;
}

export class FieldCodec implements Codec {
  constructor(private map: CodecMap) {}
  parse(
    structure: Structure,
    field: Field,
    ctx: CodecContext,
  ): Node | Promise<Node> {
    switch (field.type) {
      case "string": {
        return this.map.string.parse(structure, field, ctx);
      }
      case "number": {
        return this.map.number.parse(structure, field, ctx);
      }
      case "boolean": {
        return this.map.boolean.parse(structure, field, ctx);
      }
      case "instance": {
        return this.map.instance.parse(structure, field, ctx);
      }
      case "reference": {
        return this.map.reference.parse(structure, field, ctx);
      }
      case "list": {
        return this.map.list.parse(structure, field, ctx);
      }
      case "asset": {
        return this.map.asset.parse(structure, field, ctx);
      }
      case "map": {
        return this.map.map.parse(structure, field, ctx);
      }
      case "datetime": {
        return this.map.datetime.parse(structure, field, ctx);
      }
      case "markdown": {
        return this.map.markdown.parse(structure, field, ctx);
      }
      case "union": {
        return this.map.union.parse(structure, field, ctx);
      }
    }
  }
  stringify(
    node: Node,
    field: Field,
  ): Structure | Promise<Structure> {
    switch (field.type) {
      case "string": {
        return this.map.string.stringify(node, field);
      }
      case "number": {
        return this.map.number.stringify(node, field);
      }
      case "boolean": {
        return this.map.boolean.stringify(node, field);
      }
      case "instance": {
        return this.map.instance.stringify(node, field);
      }
      case "reference": {
        return this.map.reference.stringify(node, field);
      }
      case "list": {
        return this.map.list.stringify(node, field);
      }
      case "asset": {
        return this.map.asset.stringify(node, field);
      }
      case "map": {
        return this.map.map.stringify(node, field);
      }
      case "datetime": {
        return this.map.datetime.stringify(node, field);
      }
      case "markdown": {
        return this.map.markdown.stringify(node, field);
      }
      case "union": {
        return this.map.union.stringify(node, field);
      }
    }
  }
}
