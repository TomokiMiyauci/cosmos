import type {
  AssetField,
  BooleanField,
  DatetimeField,
  Field,
  InstanceField,
  ListField,
  Manifest,
  MarkdownField,
  ReferenceField,
  StringField,
} from "@cosmos/core";
import {
  GraphQLBoolean,
  type GraphQLFieldConfig,
  type GraphQLFieldResolver,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  type GraphQLOutputType,
  GraphQLSchema,
  GraphQLString,
  type ThunkObjMap,
} from "graphql";
import type {
  Data,
  Fetcher,
  GraphqlEntry,
  Namer,
  ResolverContext,
  SchemaPlugin,
} from "./type.ts";
import { GraphQLDateTime, GraphQLURL } from "graphql-scalars";
import { overrideName } from "./util.ts";
import { StandardNamer } from "./namers/standard.ts";
import { mapEntries } from "@std/collections";
import { GraphQLScalarType } from "graphql";

export interface SchemaConfig {
  plugins: SchemaPlugin[];
  namer?: Namer;
}

export interface BuilderContext {
  manifest: Manifest;
  fetcher: Fetcher;
}

export class SchemaBuilder {
  #namer: Namer;
  constructor(private config: SchemaConfig) {
    this.#namer = config.namer ?? new StandardNamer();
  }

  build(ctx: BuilderContext): GraphQLSchema {
    const map: Record<string, GraphQLOutputType> = {};
    const entries = Object.entries(ctx.manifest.models).map(
      ([name, schema]) => {
        const field = resolveType(
          name,
          schema,
          map,
        );

        map[name] = field;

        return {
          type: field,
          definition: schema,
        } satisfies GraphqlEntry;
      },
    );

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
  name: string,
  field: Field,
  models: Record<string, GraphQLOutputType>,
): GraphQLOutputType {
  switch (field.type) {
    case "string":
    case "markdown": {
      return new GraphQLScalarType({
        ...GraphQLString,
        name,
        description: field.description,
      });
    }
    case "boolean": {
      return new GraphQLScalarType({
        ...GraphQLBoolean,
        name,
        description: field.description,
      });
    }
    case "datetime": {
      return new GraphQLScalarType({
        ...GraphQLDateTime,
        name,
        description: field.description,
      });
    }
    case "asset": {
      return new GraphQLScalarType({
        ...GraphQLURL,
        name,
        description: field.description,
      });
    }

    // TODO: implement as scalar
    case "instance":
    case "reference": {
      const model = models[field.model];

      if (!model) throw new Error("unreachable");

      return model;
    }

    case "list": {
      const type = resolveType(name, field.field, models);

      return new GraphQLList(type);
    }

    case "map": {
      const required = new Set(field.required ?? []);

      const fields = () =>
        mapEntries(
          field.fields,
          ([key, field]) => {
            const isRequired = required.has(key);
            const type = field.type === "map"
              ? resolveType(name + key, field, models)
              : resolveScalar(field, models);

            return [
              key,
              {
                type: isRequired ? new GraphQLNonNull(type) : type,
                resolve: createResolve(key),
                description: field.description,
              } satisfies GraphQLFieldConfig<Data, ResolverContext>,
            ] as const;
          },
        );

      return new GraphQLObjectType({
        name,
        fields,
        description: field.description,
      });
    }
  }
}

type ScalarField =
  | StringField
  | BooleanField
  | InstanceField
  | InstanceField
  | AssetField
  | DatetimeField
  | ReferenceField
  | ListField
  | MarkdownField;

function resolveScalar(
  field: ScalarField,
  models: Record<string, GraphQLOutputType>,
): GraphQLOutputType {
  switch (field.type) {
    case "string":
    case "markdown": {
      return GraphQLString;
    }
    case "boolean": {
      return GraphQLBoolean;
    }
    case "instance":
    case "reference": {
      const model = models[field.model];

      if (!model) throw new Error("unreachable");

      return model;
    }
    case "asset": {
      return GraphQLURL;
    }
    case "datetime": {
      return GraphQLDateTime;
    }
    case "list": {
      const type = resolveType("item", field.field, models);

      return new GraphQLList(type);
    }
  }
}

function createResolve(
  fieldName: string,
): GraphQLFieldResolver<Data, ResolverContext> {
  return (parent) => {
    if (typeof parent === "object") {
      if (Array.isArray(parent)) {
        return parent;
      }

      if (parent instanceof Date) {
        return parent;
      }

      if (parent instanceof URL) {
        return parent;
      }

      const node = parent[fieldName];

      if (!node) return;

      return node;
    }

    return parent;
  };
}

// function resolveNode(node: Node, fetcher: Fetcher): unknown {
//   switch (node.type) {
//     case "string": {
//       return node.value;
//     }
//     case "boolean": {
//       return node.value;
//     }
//     case "reference": {
//       return fetcher.fetch(node.value);
//     }
//     case "map": {
//       return node;
//     }
//     case "datetime": {
//       return node.value;
//     }
//     case "asset": {
//       return node.value;
//     }
//     case "markdown": {
//       return node.value;
//     }
//     case "list": {
//       return node.value;
//     }
//   }
// }
