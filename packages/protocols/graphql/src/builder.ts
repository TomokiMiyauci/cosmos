import type { Datalayer, Manifest, MapNode, Node, Schema } from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLOutputType,
  GraphQLSchema,
  GraphQLString,
  type ThunkObjMap,
} from "graphql";
import type { Namer, ResolverContext, SchemaPlugin } from "./type.ts";
import { GraphQLDateTime, GraphQLURL } from "graphql-scalars";
import { overrideName } from "./util.ts";
import { StandardNamer } from "./namers/standard.ts";

export interface SchemaConfig {
  plugins: SchemaPlugin[];
  namer?: Namer;
}

export interface BuilderContext {
  manifest: Manifest;
  fetcher: Datalayer;
}

export class SchemaBuilder {
  #namer: Namer;
  constructor(private config: SchemaConfig) {
    this.#namer = config.namer ?? new StandardNamer();
  }

  build(ctx: BuilderContext): GraphQLSchema {
    const entries = ctx.manifest.definitions.map((definition) => {
      const fields: ThunkObjMap<GraphQLFieldConfig<unknown, ResolverContext>> =
        () =>
          definition.schemas.reduce((acc, cur) => {
            const field = resolveScalarType(
              cur,
              entries.map((entry) => entry.type),
            );

            const finalField = resolverOverride(field, cur.name);

            return {
              ...acc,
              [cur.name]: finalField,
            };
          }, {});

      return {
        type: new GraphQLObjectType({
          name: definition.name,
          fields,
          description: definition.description,
        }),
        definition,
      };
    });

    const queryFields = this.config.plugins
      .map((registry) => {
        return registry.provideQuery({ fetcher: ctx.fetcher, entries });
      })
      .flat();

    const fields = queryFields.reduce<
      ThunkObjMap<GraphQLFieldConfig<unknown, ResolverContext>>
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

function resolveType(
  schema: Schema,
  models: GraphQLObjectType[],
): GraphQLOutputType {
  switch (schema.type) {
    case "id":
    case "map": {
      const model = models.find((model) => schema.to === model.name);

      if (!model) throw new Error("unreachable");

      return model;
    }

    case "boolean": {
      return GraphQLBoolean;
    }

    case "string":
    case "markdown": {
      return GraphQLString;
    }

    case "datetime": {
      return GraphQLDateTime;
    }
    case "asset": {
      return GraphQLURL;
    }
  }
}

function resolve(node: Node, _: unknown, ctx: ResolverContext): unknown {
  const fetcher = ctx.fetcher;

  switch (node.type) {
    case "string": {
      return node.value;
    }
    case "boolean": {
      return node.value;
    }
    case "id": {
      return fetcher.node.fetch(node.value);
    }
    case "map": {
      return node.value;
    }
    case "datetime": {
      return node.value;
    }
    case "asset": {
      return node.value;
    }
    case "markdown": {
      return node.value;
    }
  }
}

function resolveScalarType(
  schema: Schema,
  models: GraphQLObjectType[],
): GraphQLFieldConfig<Node, ResolverContext> {
  const type = resolveType(schema, models);

  return {
    type: schema.required ? new GraphQLNonNull(type) : type,
    description: schema.description || undefined,
    resolve,
  };
}

function resolverOverride(
  config: GraphQLFieldConfig<Node, ResolverContext>,
  name: string,
): GraphQLFieldConfig<Node, ResolverContext, unknown> {
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
