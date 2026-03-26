import type { Formatter, Structure } from "@cosmos/core";
import { parse, stringify } from "@std/yaml";

export class YamlFormatter implements Formatter {
  parse(content: string): Structure {
    const result = parse(content, { schema: "failsafe" });

    this.#assert(result);

    return result;
  }

  serialize(content: Structure): string {
    return stringify(content);
  }

  #assert(_: unknown): asserts _ is Structure {
    // TODO(miyauci)
  }
}
