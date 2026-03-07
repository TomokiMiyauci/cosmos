import type { Fetcher, Manifest, Schema } from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  type ThunkObjMap,
} from "graphql";

export function createSchemaFromManifest(
  manifest: Manifest,
  fetcher: Fetcher,
): GraphQLSchema {
  const queryFields: ThunkObjMap<
    GraphQLFieldConfig<unknown, unknown>
  > = {};

  const models = manifest.definitions.map((definition) => {
    const fields: ThunkObjMap<GraphQLFieldConfig<unknown, unknown>> = () =>
      definition.schemas.reduce((acc, cur) => {
        const field = resolveScalarType(cur);

        return {
          ...acc,
          [cur.name]: field,
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

  function resolveScalarType(
    schema: Schema,
  ): GraphQLFieldConfig<object, unknown> {
    function resolveBase(): GraphQLFieldConfig<object, unknown> {
      switch (schema.type) {
        case "reference": {
          const model = models.find(([model]) => schema.to === model.name)?.[0];

          if (!model) throw new Error("unreachable");

          const field = {
            type: model,
            resolve: (source) => {
              const key = Reflect.get(source, model.name);
              const url = new URL(key);

              return fetcher.fetch(url);
            },
          } satisfies GraphQLFieldConfig<object, unknown>;

          return field;
        }

        case "boolean": {
          return { type: GraphQLBoolean };
        }

        case "string": {
          return { type: GraphQLString };
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

  models.forEach(([model, members]) => {
    queryFields[model.name] = {
      type: model,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => {
        const url = new URL(id);

        return fetcher.fetch(url);
      },
    };

    queryFields[`all${model.name}s`] = {
      type: new GraphQLList(model),
      resolve: async () => {
        const urls = members.map((key) => new URL(key));

        const result = await Promise.all(urls.map((url) => fetcher.fetch(url)));

        return result;
      },
    };
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType({ name: "Query", fields: queryFields }),
  });
}
