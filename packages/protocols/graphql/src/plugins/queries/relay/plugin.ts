import {
  type Connection,
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
} from "graphql-relay";
import type {
  GraphqlEntry,
  GraphQLQueryField,
  QueryContext,
  SchemaPlugin,
} from "../../../type.ts";
import { type GraphQLObjectType, isObjectType } from "graphql";
import type { Node } from "@cosmos/core";

export class RelayPlugin implements SchemaPlugin {
  name = "relay";
  provideQuery(ctx: QueryContext): GraphQLQueryField[] {
    return ctx.entries.filter(isGraphObjectEntry).map(
      ({ type: entry }) => {
        const { connectionType } = connectionDefinitions({
          nodeType: entry,
        });
        const name = `${entry.name}Collection`;

        return {
          name,
          type: {
            type: connectionType,
            args: connectionArgs,
            async resolve(
              _,
              args,
              ctx,
            ): Promise<Connection<Node>> {
              const model = entry.name;
              const keys = await ctx.fetcher.list(model);
              const promise = keys.map((key) => ctx.fetcher.fetch(key));
              const result = await Promise.all(promise);
              const collection = connectionFromArray(result, args);

              return collection;
            },
          },
        };
      },
    );
  }
}

interface GraphObjectEntry extends GraphqlEntry {
  type: GraphQLObjectType;
}

function isGraphObjectEntry(
  graphEntry: GraphqlEntry,
): graphEntry is GraphObjectEntry {
  return isObjectType(graphEntry.type);
}
