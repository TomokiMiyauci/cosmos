import type { DirectiveLocation, GraphQLArgument } from "graphql";

export interface ExecutableDirective {
  name: string;
  locations: DirectiveLocation[];
  args?: GraphQLArgument[];
  isRepeatable: boolean;
  resolve(value: unknown): unknown;
}
