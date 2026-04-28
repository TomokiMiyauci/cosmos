import type { GraphQLSchema } from "graphql";

export interface Plugin {
  transform(schema: GraphQLSchema): GraphQLSchema;
}
