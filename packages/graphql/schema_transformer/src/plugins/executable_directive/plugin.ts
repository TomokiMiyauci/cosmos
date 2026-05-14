import { defaultFieldResolver, GraphQLSchema } from "graphql";
import type { Plugin } from "../../type.ts";
import type { ExecutableDirective } from "@miyauci/graphql-directives";
import { MapperKind, mapSchema, type SchemaMapper } from "@graphql-tools/utils";
import { DirectiveLocation } from "graphql";
import { GraphQLDirective } from "graphql";

interface Options {
  directives: ExecutableDirective[];
}

export class ExecutableDirectivePlugin implements Plugin {
  constructor(public options: Options) {}

  transform(schema: GraphQLSchema): GraphQLSchema {
    return applySchema(schema, this.options.directives);
  }
}

function applySchema(
  schema: GraphQLSchema,
  directives: ExecutableDirective[],
): GraphQLSchema {
  const config = schema.toConfig();
  const grpahqlDirecives = directives.map(toGraphqlDirective);
  const newDefinition = new GraphQLSchema({
    ...config,
    directives: config.directives.concat(grpahqlDirecives),
  });

  const mappers = directives.map(toMapper);
  // const mergedMapper = mergeMapper(...mappers);
  // const newSchema = mapSchema(newDefinition, mergedMapper);

  return mappers.reduce(mapSchema, newDefinition);
  // return newSchema;
}

function toGraphqlDirective(directive: ExecutableDirective): GraphQLDirective {
  return new GraphQLDirective({
    name: directive.name,
    locations: directive.locations,
    // args: directive.args,
  });
}

function toMapper(directive: ExecutableDirective): SchemaMapper {
  const mapper = directive.locations.reduce<SchemaMapper>((acc, location) => {
    switch (location) {
      case DirectiveLocation.FIELD: {
        acc[MapperKind.OBJECT_FIELD] = (fieldConfig) => {
          const { resolve = defaultFieldResolver } = fieldConfig;

          fieldConfig.resolve = async function (
            source,
            args,
            context,
            info,
          ): Promise<unknown> {
            const result = await resolve(source, args, context, info);
            const directiveNodes = info.fieldNodes.flatMap((node) =>
              node.directives
            ).filter((v) => !!v);

            const targetDirectiveNodes = directiveNodes.filter((node) =>
              node.name.value === directive.name
            );

            const resolved = targetDirectiveNodes.reduce((acc) => {
              return directive.resolve(acc);
            }, result);

            return resolved;
          };

          return fieldConfig;
        };

        break;
      }
      case DirectiveLocation.QUERY:
      case DirectiveLocation.MUTATION:
      case DirectiveLocation.SUBSCRIPTION:
      case DirectiveLocation.FRAGMENT_DEFINITION:
      case DirectiveLocation.FRAGMENT_SPREAD:
      case DirectiveLocation.INLINE_FRAGMENT:
      case DirectiveLocation.VARIABLE_DEFINITION:
      case DirectiveLocation.SCHEMA:
      case DirectiveLocation.SCALAR:
      case DirectiveLocation.OBJECT:
      case DirectiveLocation.FIELD_DEFINITION:
      case DirectiveLocation.ARGUMENT_DEFINITION:
      case DirectiveLocation.INTERFACE:
      case DirectiveLocation.UNION:
      case DirectiveLocation.ENUM:
      case DirectiveLocation.ENUM_VALUE:
      case DirectiveLocation.INPUT_OBJECT:
      case DirectiveLocation.INPUT_FIELD_DEFINITION: {
        break;
      }
    }

    return acc;
  }, {});

  return mapper;
}
