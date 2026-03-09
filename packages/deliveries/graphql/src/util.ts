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
  const models = manifest.definitions.map((definition) => {
    const fields: ThunkObjMap<GraphQLFieldConfig<unknown, unknown>> = () =>
      definition.schemas.reduce((acc, cur) => {
        const field = resolveScalarType(
          cur,
          fetcher,
          models.map(([model]) => model),
        );

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

  const entries: GraphEntry[] = models.map(([model, ids]) => {
    const sources = ids.map((id) => new URL(id));

    return {
      type: model,
      sources,
    };
  });
  const queryFields = [new SinletonQueryFeature(), new AllQueryFeature()]
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
): GraphQLFieldConfig<object, unknown> {
  function resolveBase(): GraphQLFieldConfig<object, unknown> {
    switch (schema.type) {
      case "reference": {
        const model = models.find((model) => schema.to === model.name);

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

export interface GrqphQLSchemaPlugin {
  name: string;

  feature: Feature;
}

type Feature = QueryFeature | FieldFeature;

interface QueryFeature {
  feature: "query";
  provide: QueryProvider;
}

interface FieldFeature {
  feature: "field";
  provide: FieldProvider;
}

interface FieldProvider {
  (ctx: QueryContext): GraphQLQueryField[];
}

interface QueryProvider {
  (ctx: QueryContext): GraphQLQueryField[];
}

interface QueryContext {
  fetcher: Fetcher;
  entries: GraphEntry[];
}

interface GraphEntry {
  type: GraphQLObjectType;
  sources: URL[];
}

interface GraphQLQueryField {
  name: string;
  field: GraphQLFieldConfig<unknown, unknown>;
}

export class AllQueryFeature implements QueryFeature {
  feature = "query" as const;

  provide(ctx: QueryContext): GraphQLQueryField[] {
    const { fetcher, entries } = ctx;

    return entries.map((schema) => {
      return {
        name: `all${schema.type.name}s`,
        field: {
          type: new GraphQLList(schema.type),
          resolve: async () => {
            const result = await Promise.all(
              schema.sources.map((url) => fetcher.fetch(url)),
            );

            return result;
          },
        },
      };
    });
  }
}

class SinletonQueryFeature implements QueryFeature {
  feature = "query" as const;

  provide(ctx: QueryContext): GraphQLQueryField[] {
    const { fetcher, entries } = ctx;

    return entries.map((schema) => {
      return {
        name: schema.type.name,
        field: {
          type: schema.type,
          args: { id: { type: new GraphQLNonNull(GraphQLID) } },
          resolve: (_, { id }) => {
            const url = new URL(id);

            return fetcher.fetch(url);
          },
        },
      };
    });
  }
}
