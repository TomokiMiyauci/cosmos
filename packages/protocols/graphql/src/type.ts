import type { Datalayer, Manifest, Node } from "@cosmos/core";
import type {
  GraphQLEnumType,
  GraphQLFieldConfig,
  GraphQLInterfaceType,
  GraphQLObjectType,
  GraphQLObjectTypeConfig,
  GraphQLScalarType,
  GraphQLUnionType,
} from "graphql";

export interface ResolverContext {
  fetcher: Fetcher;
}

export interface Resource {
  id: string;
  node: Node;
}

export interface Fetcher {
  fetch(id: string): Promise<Node> | Node;
  list(id: string): Promise<string[]> | string[];
}

export interface QueryContext {
  entries: GraphqlNamedOutputType[];
}

export interface GraphQLQueryField {
  name: string;
  type: GraphQLFieldConfig<unknown, ResolverContext>;
}

export interface TypeBuilder {
  build(ctx: BuilderContext): GraphqlNamedOutputType[];
}

export interface BuilderContext {
  manifest: Manifest;
  datalayer: Datalayer;
}

export interface Plugin {
  transform?(
    config: GraphQLObjectTypeConfig<Resource, unknown>,
  ): GraphQLObjectTypeConfig<Resource, unknown>;
  provideQuery?(ctx: QueryContext): GraphQLQueryField[];
  objectType?(type: GraphQLObjectType): GraphQLObjectType;
  objectField?(
    field: GraphQLFieldConfig<unknown, unknown>,
  ): GraphQLFieldConfig<unknown, unknown>;
}

export type GraphqlNamedOutputType =
  | GraphQLScalarType
  | GraphQLObjectType<Resource>
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType;
