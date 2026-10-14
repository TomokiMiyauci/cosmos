import type { Property, Resolvers, Schema, Term } from "~type";
import type { SchemaView } from "@cosmos/content";
import { DateTimeResolver } from "graphql-scalars";
import Mutation from "./mutation.ts";
import Query from "./query.ts";
import Entry from "./entry.ts";
import type { Context } from "./type.ts";

export default {
  Mutation,
  Query,
  Model: {
    schema: {
      async resolve(view, _, context): Promise<SchemaView> {
        const schemaView = await context.queries.schema.findById(view.schemaId);

        if (!schemaView) throw new Error();

        return schemaView;
      },
    },
  },
  Entry,
  Schema: {
    __resolveType(view): Schema["__typename"] {
      switch (view.type) {
        case "boolean": {
          return "BooleanSchema";
        }
        case "string": {
          return "StringSchema";
        }
        case "number": {
          return "NumberSchema";
        }
        case "list": {
          return "SequenseSchema";
        }
        case "map": {
          return "MapSchema";
        }
        case "reference": {
          return "ReferenceSchema";
        }
        case "union": {
          return "UnionSchema";
        }
      }
    },
  },
  StringSchema: {
    term: {
      resolve(view): Term | null {
        switch (view.term) {
          case "date":
            return "DATE";
          case "datetime":
            return "DATETIME";

          default: {
            return null;
          }
        }
      },
    },
  },

  MapSchema: {
    required: {
      resolve(parent): string[] {
        const required = new Set<string>();

        for (const [key, prop] of Object.entries(parent.properties)) {
          if (prop.required) {
            required.add(key);
          }
        }

        return [...required];
      },
    },
    properties: {
      resolve(parent): Property[] {
        const properties = Object.entries(parent.properties).map(
          ([key, prop]) => {
            return {
              __typename: "Property" as const,
              key,
              value: prop.schema.id,
            };
          },
        );

        return properties;
      },
    },
  },
  SequenseSchema: {
    item: {
      resolve(parent): string {
        return parent.item.id;
      },
    },
  },
  DateTime: DateTimeResolver,
} satisfies Resolvers<Context>;
