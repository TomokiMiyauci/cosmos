import type { Protocol, ProtocolArgs, Usecases } from "@cosmos/content";
import { resolvers } from "./resolver.ts";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./schema.graphql" with { type: "text" };
import { createYoga, type YogaServerInstance } from "graphql-yoga";

export interface GraphqlProtocolPorts {
  prefix?: string;
}

export class GraphqlProtocol implements Protocol {
  // deno-lint-ignore ban-types
  #handler: YogaServerInstance<Usecases, {}>;

  constructor(ports: GraphqlProtocolPorts) {
    const schema = makeExecutableSchema({ resolvers, typeDefs });
    const yoga = createYoga<Usecases>({
      schema,
      graphqlEndpoint: ports.prefix,
    });

    this.#handler = yoga;
  }
  handle(args: ProtocolArgs): Promise<Response> | Response {
    return this.#handler.fetch(args.request, args.usecases);
  }
}
