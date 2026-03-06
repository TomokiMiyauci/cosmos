import type { Manifest, Schema } from "@cosmos/core";
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

export function createSchemaFromManifest(manifest: Manifest): GraphQLSchema {
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
  ): GraphQLFieldConfig<unknown, unknown> {
    function resolve(): GraphQLFieldConfig<object, unknown> {
      switch (schema.type) {
        case "reference": {
          const model = models.find(([model]) => schema.to === model.name)?.[0];

          if (!model) throw new Error("unreachable");

          const field = {
            type: model,
            description: schema.description || undefined,
            resolve: (source) => {
              const key = Reflect.get(source, model.name);

              return documentMap.get(key);
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

    const { type } = resolve();
    return {
      type: schema.required ? new GraphQLNonNull(type) : type,
      description: schema.description || undefined,
    };
  }

  const documentMap = new Map(
    manifest.entries.map(({ key, value }) => [key, value]),
  );

  models.forEach(([model, members]) => {
    queryFields[model.name] = {
      type: model,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => documentMap.get(id),
    };

    queryFields[`all${model.name}s`] = {
      type: new GraphQLList(model),
      resolve: () => members.map((key) => documentMap.get(key)),
    };
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType({ name: "Query", fields: queryFields }),
  });
}
