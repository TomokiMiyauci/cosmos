import { node2Store, type NodeWithId } from "./util.ts";
import { expect } from "@std/expect";
import { describe, it } from "@std/testing/bdd";
import type { Store } from "../fields/type.ts";

describe("node2Store", () => {
  it("should be pass", () => {
    const table = [
      [
        { id: "a", type: "string", value: "value" },
        { a: { type: "string", value: "value" } },
      ],
      [
        { id: "a", type: "number", value: 0 },
        { a: { type: "number", value: 0 } },
      ],
      [
        { id: "a", type: "list", value: [] },
        { a: { type: "list", value: [] } },
      ],
      [
        {
          id: "a",
          type: "list",
          value: [{ id: "b", type: "string", value: "value" }],
        },
        {
          a: { type: "list", value: ["b"] },
          b: { type: "string", value: "value" },
        },
      ],
      [
        {
          id: "a",
          type: "map",
          value: {},
        },
        {
          a: { type: "link", value: {} },
        },
      ],
      [
        {
          id: "a",
          type: "map",
          value: { title: { type: "string", id: "b", value: "value" } },
        },
        {
          a: { type: "link", value: { title: "b" } },
          b: { type: "string", value: "value" },
        },
      ],
      [
        {
          id: "a",
          type: "map",
          value: { title: { type: "map", id: "b", value: {} } },
        },
        {
          a: { type: "link", value: { title: "b" } },
          b: { type: "link", value: {} },
        },
      ],
      [
        {
          id: "a",
          type: "map",
          value: {
            title: {
              type: "map",
              id: "b",
              value: { nested: { type: "string", id: "c", value: "hello" } },
            },
          },
        },
        {
          a: { type: "link", value: { title: "b" } },
          b: { type: "link", value: { nested: "c" } },
          c: { type: "string", value: "hello" },
        },
      ],
      [{
        id: "a",
        type: "map",
        value: {
          title: {
            type: "list",
            id: "b",
            value: [{
              id: "c",
              type: "string",
              value: "hello",
            }],
          },
        },
      }, {
        a: { type: "link", value: { title: "b" } },
        b: { type: "list", value: ["c"] },
        c: { type: "string", value: "hello" },
      }],
    ] satisfies [NodeWithId, Store][];

    table.forEach(([input, expected]) => {
      expect(node2Store(input)).toEqual(expected);
    });
  });
});
