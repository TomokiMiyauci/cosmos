import type { Resolver, ResolverContext } from "@cosmos/core";
import { join, toFileUrl } from "@std/path";

export class PathResolver implements Resolver {
  constructor(private root: string) {}

  resolve(specifier: string, ctx: ResolverContext): Promise<URL> | URL {
    if (URL.canParse(specifier)) return new URL(specifier);

    if (specifier.startsWith(".")) {
      return new URL(specifier, ctx.baseUrl);
    }

    const absolutePath = join(this.root, specifier);

    return toFileUrl(absolutePath);
  }

  unresolve(url: URL, ctx: ResolverContext): Promise<string> | string {
    throw new Error();
  }
}
