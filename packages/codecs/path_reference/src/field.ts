import type {
  Codec,
  CodecContext,
  Field,
  ReferenceNode,
  Structure,
} from "@cosmos/core";
import { isAbsolute, join, toFileUrl } from "@std/path";

export class PathReferenceCodec implements Codec {
  constructor(private rootDir: string) {}
  parse(structure: Structure, _: Field, ctx: CodecContext): ReferenceNode {
    if (typeof structure !== "string") throw new SyntaxError();

    const url = resolveUrl(this.rootDir, ctx.baseUrl, structure);

    return {
      type: "reference",
      value: url,
    };
  }

  stringify(): Structure {
    throw new Error("unimplemented");
  }
}

function resolveUrl(rootDir: string, baseUrl: URL, path: string): URL {
  if (isAbsolute(path)) {
    const fullPath = join(rootDir, path);

    return toFileUrl(fullPath);
  }

  return new URL(path, baseUrl);
}
