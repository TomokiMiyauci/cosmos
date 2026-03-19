import type {
  BooleanNode,
  Fetcher,
  IdNode,
  Manifest,
  MapNode,
  Node,
  Schema,
  StringNode,
} from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  type ThunkObjMap,
} from "graphql";
import type { GraphEntry, NamingStrategy, SchemaPlugin } from "./type.ts";
import { toCamelCase, toPascalCase } from "@std/text";
import { overrideName } from "./util.ts";

export interface SchemaConfig {
  plugins: SchemaPlugin[];
  namer?: NamingStrategy;
}

export interface BuilderContext {
  manifest: Manifest;
  fetcher: Fetcher;
}

export class SchemaBuilder {
  #namer: NamingStrategy;
  constructor(private config: SchemaConfig) {
    this.#namer = config.namer ?? defaultNamer;
  }

  build(ctx: BuilderContext): GraphQLSchema {
    const models = ctx.manifest.definitions.map((definition) => {
      const fields: ThunkObjMap<GraphQLFieldConfig<unknown, unknown>> = () =>
        definition.schemas.reduce((acc, cur) => {
          const field = resolveScalarType(
            cur,
            ctx.fetcher,
            models.map(([model]) => model),
          );

          const finalField = resolverOverride(field, cur.name);

          return {
            ...acc,
            [cur.name]: finalField,
          };
        }, {});

      return [
        new GraphQLObjectType({
          name: toPascalCase(definition.name),
          fields,
        }),
        definition.members,
      ] satisfies [GraphQLObjectType, string[]];
    });

    const entries: GraphEntry[] = models.map(([model, ids]) => {
      return {
        type: model,
        sources: ids,
      };
    });

    const queryFields = this.config.plugins
      .map((registry) => {
        return registry.provideQuery({ fetcher: ctx.fetcher, entries });
      })
      .flat();

    const fields = queryFields.reduce<
      ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>>
    >((acc, field) => {
      return {
        ...acc,
        [field.name]: field.type,
      };
    }, {});

    const query = new GraphQLObjectType({ name: "Query", fields });
    const schema = new GraphQLSchema({ query });
    const finalSchema = overrideName(this.#namer, schema);

    return finalSchema;
  }
}

const defaultNamer = {
  field(name): string {
    return toCamelCase(name);
  },
  type(name): string {
    return toPascalCase(name);
  },
} satisfies NamingStrategy;

function resolveScalarType(
  schema: Schema,
  fetcher: Fetcher,
  models: GraphQLObjectType[],
): GraphQLFieldConfig<Node, unknown> {
  function resolveBase(): GraphQLFieldConfig<Node, unknown> {
    switch (schema.type) {
      case "id": {
        const model = models.find((model) =>
          toPascalCase(schema.to) === model.name
        );

        if (!model) throw new Error("unreachable");

        const field = {
          type: model,
          resolve: (source) => {
            return fetcher.fetch((source as IdNode).value);
          },
        } satisfies GraphQLFieldConfig<Node, unknown>;

        return field;
      }

      case "map": {
        const fields = schema.fields.reduce((acc, field) => {
          const config = resolveScalarType(field, fetcher, models);
          const finalConfig = resolverOverride(config, field.name);

          return {
            ...acc,
            [field.name]: finalConfig,
          };
        }, {});
        const type = new GraphQLObjectType({
          fields,
          name: schema.name,
        });

        const field = {
          type,
          resolve: (node) => {
            return (node as MapNode).value;
          },
        } satisfies GraphQLFieldConfig<Node, unknown>;

        return field;
      }

      case "boolean": {
        return {
          type: GraphQLBoolean,
          resolve: (node) => {
            return (node as BooleanNode).value;
          },
        };
      }

      case "string": {
        return {
          type: GraphQLString,
          resolve: (node) => {
            return (node as StringNode).value;
          },
        };
      }
    }
  }

  const { type, ...rest } = resolveBase();
  return {
    ...rest,
    type: schema.required ? new GraphQLNonNull(type) : type,
    description: schema.description || undefined,
  };
}

function resolverOverride(
  config: GraphQLFieldConfig<Node, unknown, unknown>,
  name: string,
): GraphQLFieldConfig<Node, unknown, unknown> {
  const { resolve, ...rest } = config;

  return {
    ...rest,
    resolve(node, ...rest): unknown {
      const value = (node as MapNode).value;
      const item = value[name];

      if (!item) return null;

      if (resolve) {
        return resolve(item, ...rest);
      }
      return item;
    },
  };
}
