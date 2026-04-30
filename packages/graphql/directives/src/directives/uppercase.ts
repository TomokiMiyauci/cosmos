import type { DirectiveLocation } from "graphql";
import type { ExecutableDirective } from "../type.ts";

export class UppercaseDirective implements ExecutableDirective {
  name: string = "uppercase";
  isRepeatable: boolean = false;
  resolve(value: unknown): unknown {
    if (typeof value === "string") {
      return value.toUpperCase();
    }

    return value;
  }
  constructor(public locations: DirectiveLocation[]) {}
}
