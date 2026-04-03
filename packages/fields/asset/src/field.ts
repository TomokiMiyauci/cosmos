import type {
  Field,
  FieldCodec,
  FieldContext,
  Node,
  StructureValue,
} from "@cosmos/core";
import { isAbsolute, join, toFileUrl } from "@std/path";

export class AssetFieldCodec implements FieldCodec {
  constructor(private rootDir: string) {}
  parse(structure: StructureValue, _: Field, ctx: FieldContext): Node {
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
