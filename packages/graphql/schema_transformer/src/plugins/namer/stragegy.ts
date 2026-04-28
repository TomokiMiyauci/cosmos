import type { Strategy } from "./type.ts";
import { toCamelCase, toPascalCase } from "@std/text";

export class Standard implements Strategy {
  field(name: string): string {
    return toCamelCase(name);
  }
  type(name: string): string {
    return toPascalCase(name);
  }
}
