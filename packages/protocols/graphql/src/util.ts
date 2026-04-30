import {
  type GraphQLNamedOutputType,
  type GraphQLNamedType,
  isOutputType,
} from "graphql";

export function isNamedOutputType(
  type: GraphQLNamedType,
): type is GraphQLNamedOutputType {
  return isOutputType(type);
}
