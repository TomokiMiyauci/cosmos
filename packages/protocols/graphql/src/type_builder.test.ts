import test from "./type_builder.test.json" with { type: "json" };
import { describe, it } from "@std/testing/bdd";
import { type GraphQLObjectType, parse, print, printType } from "graphql";
import type { Schema } from "@cosmos/core";
import { createRoot } from "./type_builder.ts";
import { expect } from "@std/expect";
import type { Fetcher } from "./type.ts";

describe("type_builder", () => {
  for (const testCase of test.cases) {
    it(testCase.description ?? "should match", () => {
      const map: Record<string, GraphQLObjectType> = {};
      const objectType = createRoot(
        testCase.input.name,
        testCase.input.schema as Schema,
        {
          map,
          fetcher: {
            fetch: () => {},
            list: () => {},
          } as unknown as Fetcher,
        },
      );
      map[testCase.input.name] = objectType;

      const type = parse(testCase.output);
      const left = printType(objectType);
      const right = print(type);

      expect(left).toBe(right);
    });
  }
});
