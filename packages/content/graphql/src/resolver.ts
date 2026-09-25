import type {
  CreateEntryResult,
  MutationResolvers,
  Property,
  QueryResolvers,
  Resolvers,
  Schema,
  Term,
} from "./generated/resolver_type.ts";
import type {
  Commands,
  EntryView,
  ModelView,
  Readers,
  SchemaView,
} from "@cosmos/content";
import { fromNode, type Node, toNode } from "@cosmos/schema-node";
import { DateTimeResolver } from "graphql-scalars";

export interface Context {
  commands: Commands;
  queries: Readers;
}

const Mutation = {
  createEntry: {
    async resolve(_, args, context): Promise<CreateEntryResult> {
      const model = args.input.model;
      const contents = fromNode(args.input.content);
      const [data, error] = await context.commands.entry.create.execute({
        model,
        contents,
      });

      if (error) {
        // switch (error.type) {
        //   case "INVALID_CONTENT": {
        //   }
        //   case "INVALID_MODEL": {}
        //   case "MODEL_NOT_FOUND": {}
        //   case "SCHEMA_NOT_FOUND": {}
        // }

        throw new Error();
      }

      return { id: data, __typename: "CreateEntrySuccess" };
    },
  },

  deleteEntry: {
    async resolve(_, args, context): Promise<boolean> {
      const [__, error] = await context.commands.entry.delete.execute(args.id);

      if (error) {
        switch (error.type) {
          case "INVALID_ID": {
            return false;
          }
        }
      }

      return true;
    },
  },
} satisfies MutationResolvers<Context>;

const Query = {
  entry: {
    async resolve(_, args, context): Promise<EntryView | null> {
      const entryView = await context.queries.entry.findById(args.id);

      return entryView;
    },
  },
  entries: {
    async resolve(_, args, context): Promise<EntryView[]> {
      const entreis = await context.queries.entry.findAll({
        model: args.model ?? undefined,
      });

      return entreis;
    },
  },
  models: {
    async resolve(_, __, context): Promise<ModelView[]> {
      const models = await context.queries.model.findAll();

      return models;
    },
  },
  model: {
    async resolve(_, args, context): Promise<ModelView | null> {
      const model = await context.queries.model.findById(args.id);

      return model;
    },
  },
  schemas: {
    resolve(_, __, context): Promise<SchemaView[]> {
      return context.queries.schema.findAll();
    },
  },
  schema: {
    resolve(_, args, context): Promise<SchemaView | null> {
      return context.queries.schema.findById(args.id);
    },
  },
} satisfies QueryResolvers<Context>;

export const resolvers = {
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
  Entry: {
    createdAt: {
      resolve(view): Date {
        return new Date(view.createdAt.epochMilliseconds);
      },
    },
    updatedAt: {
      resolve(view): Date {
        return new Date(view.updatedAt.epochMilliseconds);
      },
    },
    model: {
      async resolve(view, _, context): Promise<ModelView> {
        const model = await context.queries.model.findById(view.modelId);

        if (!model) throw new Error();

        return model;
      },
    },
    content: {
      resolve(view): Node {
        const node = toNode(view.content);

        return node;
      },
    },
  },
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
