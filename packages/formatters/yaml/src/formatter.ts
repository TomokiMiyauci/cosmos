import type { Content, Formatter } from "@cosmos/core";
import { parse, stringify } from "@std/yaml";

export class YamlFormatter implements Formatter {
  parse(content: string): Content {
    const result = parse(content);

    this.#assert(result);

    return result;
  }

  serialize(content: Content): string {
    return stringify(content);
  }

  #assert(_: unknown): asserts _ is Content {
    // TODO(miyauci)
  }
}
