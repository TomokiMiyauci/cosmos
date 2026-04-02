import type { Datalayer, Manifest, MapNode, Node, Schema } from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  type ThunkObjMap,
} from "graphql";
import type { Namer, SchemaPlugin } from "./type.ts";
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
      const fields: ThunkObjMap<GraphQLFieldConfig<unknown, unknown>> = () =>
        definition.schemas.reduce((acc, cur) => {
          const field = resolveScalarType(
            cur,
            ctx.fetcher,
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

function resolveBase(
  schema: Schema,
  fetcher: Datalayer,
  models: GraphQLObjectType[],
): GraphQLFieldConfig<Node, unknown> {
  switch (schema.type) {
    case "id": {
      const model = models.find((model) => schema.to === model.name);

      if (!model) throw new Error("unreachable");

      const field = { type: model } satisfies GraphQLFieldConfig<Node, unknown>;

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
      } satisfies GraphQLFieldConfig<Node, unknown>;

      return field;
    }

    case "boolean": {
      return { type: GraphQLBoolean };
    }

    case "string":
    case "markdown": {
      return { type: GraphQLString };
    }

    case "datetime": {
      return { type: GraphQLDateTime };
    }
    case "asset": {
      return { type: GraphQLURL };
    }
  }
}

function resolveScalarType(
  schema: Schema,
  fetcher: Datalayer,
  models: GraphQLObjectType[],
): GraphQLFieldConfig<Node, unknown> {
  const { type, ...rest } = resolveBase(schema, fetcher, models);

  return {
    ...rest,
    type: schema.required ? new GraphQLNonNull(type) : type,
    description: schema.description || undefined,
    resolve: (node) => {
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
    },
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
