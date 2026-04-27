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

export interface Namer {
  field(name: string): string;
  type(name: string): string;
}

export interface TypeBuilder {
  build(ctx: BuilderContext): GraphQLObjectType<Resource>[];
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
}

export type GraphqlNamedOutputType =
  | GraphQLScalarType
  | GraphQLObjectType<Resource>
  | GraphQLInterfaceType
  | GraphQLUnionType
  | GraphQLEnumType;
