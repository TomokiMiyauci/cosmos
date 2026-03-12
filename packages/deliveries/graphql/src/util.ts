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
import type { GraphEntry } from "./type.ts";
import { SingleQueryFeature } from "./plugins/queries/single/feature.ts";
import { AllQueryFeature } from "./plugins/queries/all/feature.ts";

export function createSchemaFromManifest(
  manifest: Manifest,
  fetcher: Fetcher,
): GraphQLSchema {
  const models = manifest.definitions.map((definition) => {
    const fields: ThunkObjMap<GraphQLFieldConfig<unknown, unknown>> = () =>
      definition.schemas.reduce((acc, cur) => {
        const field = resolveScalarType(
          cur,
          fetcher,
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
        name: definition.name,
        fields,
      }),
      definition.members,
    ] satisfies [GraphQLObjectType, string[]];
  });

  const entries: GraphEntry[] = models.map(([model, ids]) => {
    const sources = ids.map((id) => new URL(id));

    return {
      type: model,
      sources,
    };
  });
  const queryFields = [new SingleQueryFeature(), new AllQueryFeature()]
    .map((registry) => {
      return registry.provide({ fetcher, entries });
    })
    .flat();

  const fields = queryFields.reduce<
    ThunkObjMap<GraphQLFieldConfig<unknown, unknown, unknown>>
  >((acc, field) => {
    return {
      ...acc,
      [field.name]: field.field,
    };
  }, {});

  return new GraphQLSchema({
    query: new GraphQLObjectType({ name: "Query", fields }),
  });
}

function resolveScalarType(
  schema: Schema,
  fetcher: Fetcher,
  models: GraphQLObjectType[],
): GraphQLFieldConfig<Node, unknown> {
  function resolveBase(): GraphQLFieldConfig<Node, unknown> {
    switch (schema.type) {
      case "id": {
        const model = models.find((model) => schema.to === model.name);

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
