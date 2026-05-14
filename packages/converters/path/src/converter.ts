import type { Converter, ConverterContext, Structure } from "@cosmos/core";
import { isAbsolute } from "@std/path";

export class PathConverter implements Converter {
  standardize(structure: Structure, ctx: ConverterContext): Structure {
    if (typeof structure === "string") {
      const url = resolveUrl(ctx.base, ctx.baseUrl, structure);

      return url.href;
    }

    return structure;
  }

  specialize(): Structure {
    throw new Error("unimplemented");
  }
}

function resolveUrl(root: URL, baseUrl: URL, path: string): URL {
  if (isAbsolute(path)) {
    return new URL(path, root);
  }

  return new URL(path, baseUrl);
}
