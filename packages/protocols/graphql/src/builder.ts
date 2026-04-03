import type { Datalayer, Manifest, MapNode, Node, Schema } from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  type GraphQLFieldResolver,
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

            return {
              ...acc,
              [cur.name]: field,
            };
          }, {});

      const objectType = new GraphQLObjectType({
        name: definition.name,
        fields,
        description: definition.description,
      });

      return {
        type: objectType,
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
    case "string": {
      return GraphQLString;
    }
    case "boolean": {
      return GraphQLBoolean;
    }
    case "datetime": {
      return GraphQLDateTime;
    }
    case "asset": {
      return GraphQLURL;
    }
    case "markdown": {
      return GraphQLString;
    }
    case "id":
    case "map": {
      const model = models.find((model) => schema.to === model.name);

      if (!model) throw new Error("unreachable");

      return model;
    }
  }
}

function resolveScalarType(
  schema: Schema,
  models: GraphQLObjectType[],
): GraphQLFieldConfig<MapNode, ResolverContext> {
  const type = resolveType(schema, models);

  const objectType = {
    type: schema.required ? new GraphQLNonNull(type) : type,
    description: schema.description || undefined,
    resolve: createResolve(schema.name),
  } satisfies GraphQLFieldConfig<MapNode, ResolverContext>;

  return objectType;
}

function createResolve(
  fieldName: string,
): GraphQLFieldResolver<MapNode, ResolverContext> {
  return (parent, _, ctx) => {
    const node = parent.value[fieldName];

    if (!node) return;

    return resolveNode(node, ctx.fetcher);
  };
}

function resolveNode(node: Node, fetcher: Datalayer): unknown {
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
      return node;
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
