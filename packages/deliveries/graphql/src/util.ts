import type { FieldType, Manifest } from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLScalarType,
  GraphQLSchema,
  GraphQLString,
  type ThunkObjMap,
} from "graphql";

const ScalarMap = {
  string: GraphQLString,
  boolean: GraphQLBoolean,
} satisfies Record<FieldType, GraphQLScalarType>;

export function createSchemaFromManifest(manifest: Manifest): GraphQLSchema {
  const queryFields: ThunkObjMap<
    GraphQLFieldConfig<unknown, unknown>
  > = {};

  for (const collection of manifest.collections) {
    const fields = collection.meta.reduce<
      ThunkObjMap<GraphQLFieldConfig<unknown, unknown>>
    >((acc, cur) => {
      const base = ScalarMap[cur.type];
      const type = cur.required ? new GraphQLNonNull(base) : base;
      const field = {
        type,
        description: cur.description || undefined,
      } satisfies GraphQLFieldConfig<unknown, unknown>;

      return {
        ...acc,
        [cur.name]: field,
      };
    }, {});

    const ModelType = new GraphQLObjectType({
      name: collection.typeName,
      fields,
    });

    queryFields[collection.name] = {
      type: ModelType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve: (_, { id }) => collection.documents.find((doc) => doc.id === id),
    };

    queryFields[`all${collection.typeName}s`] = {
      type: new GraphQLList(ModelType),
      resolve: () => collection.documents,
    };
  }

  return new GraphQLSchema({
    query: new GraphQLObjectType({ name: "Query", fields: queryFields }),
  });
}
