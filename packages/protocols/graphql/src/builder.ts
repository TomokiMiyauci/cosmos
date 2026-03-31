import type {
  AssetMapping,
  AssetNode,
  BooleanNode,
  Datalayer,
  DatetimeNode,
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
  asset: AssetMapping;
}

export class SchemaBuilder {
  #namer: Namer;
  constructor(private config: SchemaConfig) {
    this.#namer = config.namer ?? new StandardNamer();
  }

  build(ctx: BuilderContext): GraphQLSchema {
    const models = ctx.manifest.definitions.map((definition) => {
      const fields: ThunkObjMap<GraphQLFieldConfig<unknown, unknown>> = () =>
        definition.schemas.reduce((acc, cur) => {
          const field = resolveScalarType(
            cur,
            ctx.fetcher,
            models,
            ctx.asset,
          );

          const finalField = resolverOverride(field, cur.name);

          return {
            ...acc,
            [cur.name]: finalField,
          };
        }, {});

      return new GraphQLObjectType({
        name: definition.name,
        fields,
        description: definition.description,
      });
    });

    const queryFields = this.config.plugins
      .map((registry) => {
        return registry.provideQuery({ fetcher: ctx.fetcher, entries: models });
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

function resolveScalarType(
  schema: Schema,
  fetcher: Datalayer,
  models: GraphQLObjectType[],
  asset: AssetMapping,
): GraphQLFieldConfig<Node, unknown> {
  function resolveBase(): GraphQLFieldConfig<Node, unknown> {
    switch (schema.type) {
      case "id": {
        const model = models.find((model) => schema.to === model.name);

        if (!model) throw new Error("unreachable");

        const field = {
          type: model,
          resolve: (source) => {
            return fetcher.node.fetch((source as IdNode).value);
          },
        } satisfies GraphQLFieldConfig<Node, unknown>;

        return field;
      }

      case "map": {
        const fields = schema.fields.reduce((acc, field) => {
          const config = resolveScalarType(field, fetcher, models, asset);
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

      case "datetime": {
        return {
          type: GraphQLDateTime,
          resolve: (node) => {
            return (node as DatetimeNode).value;
          },
        };
      }
      case "asset": {
        return {
          type: GraphQLURL,
          resolve: (node) => {
            const url = new URL((node as AssetNode).value);
            const resolved = asset.resolve(url);

            return resolved;
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
