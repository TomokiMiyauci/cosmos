import type {
  FieldCodec,
  FieldContext,
  Node,
  StructureValue,
} from "@cosmos/core";
import { isAbsolute, join, toFileUrl } from "@std/path";

export class PathReferenceFieldCodec implements FieldCodec {
  constructor(private rootDir: string) {}
  parse(structure: StructureValue, ctx: FieldContext): Node {
    if (typeof structure !== "string") throw new SyntaxError();

    const url = resolveUrl(this.rootDir, ctx.url, structure);

    return {
      type: "id",
      value: url.toString(),
    };
  }

  strinigify(): StructureValue {
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
