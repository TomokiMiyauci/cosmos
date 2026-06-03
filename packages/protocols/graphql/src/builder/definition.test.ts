import { createObject, string } from "./definition.ts";
import { describe, it } from "@std/testing/bdd";
import { expect } from "@std/expect";
import { GraphQLString, parse, print, printType } from "graphql";
import { createStringNode } from "@cosmos/node-builder";
import dsl from "./dsl.test.json" with { type: "json" };
import type { Schema } from "@cosmos/core";
import type { Fetcher } from "../type.ts";
import { SchemaBuilder } from "@miyauci/graphql-builder";

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
        const builder = new SchemaBuilder();
        const objectType = createObject(
          testCase.input.name,
          testCase.input.schema as Schema,
          {
            builder,
            fetcher: {
              fetch: () => {},
              list: () => {},
            } as unknown as Fetcher,
          },
        );

        const type = parse(testCase.output);
        const left = printType(objectType.type);
        const right = print(type);

        expect(left).toBe(right);
      });
    }
  });
});
