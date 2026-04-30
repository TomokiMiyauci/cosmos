import { createObject, string } from "./definition.ts";
import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import {
  type GraphQLObjectType,
  GraphQLString,
  parse,
  print,
  printType,
} from "graphql";
import { createStringNode } from "@cosmos/node-builder";
import dsl from "./dsl.test.json" with { type: "json" };
import type { Schema } from "@cosmos/core";
import type { Fetcher } from "../type.ts";

describe("string", () => {
  it("should be type GrpahQLString", () => {
    expect(string.type).toBe(GraphQLString);
  });

  it("should resolve StringNode", () => {
    expect(string.resolve(createStringNode("test"))).toBe("test");
  });
});

describe("createRoot", () => {
  describe("DSL testing", () => {
    for (const testCase of dsl.cases) {
      it(testCase.description ?? "should match", () => {
        const map: Record<string, GraphQLObjectType> = {};
        const objectType = createObject(
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
});
