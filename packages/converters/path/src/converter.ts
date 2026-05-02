import type { Converter, ConverterContext, Structure } from "@cosmos/core";
import { isAbsolute, join, toFileUrl } from "@std/path";

export class PathConverter implements Converter {
  constructor(private rootDir: string) {}

  standardize(structure: Structure, ctx: ConverterContext): Structure {
    if (typeof structure === "string") {
      const url = resolveUrl(this.rootDir, ctx.baseUrl, structure);

      return url.href;
    }

    return structure;
  }

  specialize(structure: Structure): Structure {
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
