import type {
  GraphQLInputObjectType,
  GraphQLInterfaceType,
  GraphQLObjectType,
} from "graphql";

export interface Plugin {
  objectType?(type: GraphQLObjectType): GraphQLObjectType;
  inputObjectType?(type: GraphQLInputObjectType): GraphQLInputObjectType;
  interfaceType?(type: GraphQLInterfaceType): GraphQLInterfaceType;
}
