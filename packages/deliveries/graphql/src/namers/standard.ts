import type { Namer } from "../type.ts";
import { toCamelCase, toPascalCase } from "@std/text";

export class StandardNamer implements Namer {
  field(name: string): string {
    return toCamelCase(name);
  }
  type(name: string): string {
    return toPascalCase(name);
  }
}
