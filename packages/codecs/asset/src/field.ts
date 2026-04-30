import type {
  AssetNode,
  Codec,
  CodecContext,
  Field,
  Node,
  Structure,
  StructureValue,
} from "@cosmos/core";
import { isAbsolute, join, toFileUrl } from "@std/path";

export class AssetCodec implements Codec {
  constructor(private rootDir: string) {}
  parse(structure: Structure, _: Field, ctx: CodecContext): AssetNode {
    if (typeof structure !== "string") throw new SyntaxError();

    const url = resolveUrl(this.rootDir, ctx.baseUrl, structure);

    return {
      type: "asset",
      value: url,
    };
  }

  stringify(node: Node): StructureValue {
    if (node.type !== "asset") throw new Error();

    return node.value.toString();
  }
}

function resolveUrl(rootDir: string, baseUrl: URL, path: string): URL {
  if (isAbsolute(path)) {
    const fullPath = join(rootDir, path);

    return toFileUrl(fullPath);
  }

  return new URL(path, baseUrl);
}
