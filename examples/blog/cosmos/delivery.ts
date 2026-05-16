import { type DeliveryConfig } from "@cosmos/delivery";
import { Asset } from "@cosmos/delivery/asset";
import { GraphqlProtocol, SchemaBuilder } from "@cosmos/protocol-graphql";
import { RelayPlugin } from "@cosmos/protocol-graphql/relay";
import { OpenCrud } from "@cosmos/protocol-graphql/opencrud";
import { SingletonPlugin } from "@cosmos/protocol-graphql/singleton";
import { NamerPlugin } from "@miyauci/graphql-transformer/namer";
import { ExecutableDirectivePlugin } from "@miyauci/graphql-transformer/executable-directive";
import { UppercaseDirective } from "@miyauci/graphql-directives";
import { NodePlugin } from "@cosmos/protocol-graphql/node";
import { DatabaseSync } from "node:sqlite";
import { SqliteStore } from "@cosmos/store-sqlite";
import { DirectiveLocation } from "graphql";
import config from "./config.ts";

const db = new DatabaseSync(":memory:");

export default {
  protocol: new GraphqlProtocol(
    new SchemaBuilder({
      plugins: [
        new RelayPlugin(),
        new NodePlugin(),
        new OpenCrud(),
        new SingletonPlugin(),
      ],
      transformers: [
        new NamerPlugin(),
        new ExecutableDirectivePlugin({
          directives: [
            new UppercaseDirective([DirectiveLocation.FIELD]),
          ],
        }),
      ],
    }),
  ),
  middleware: [new Asset()],
  store: new SqliteStore(db),
  base: {
    config,
    location: new URL(import.meta.resolve("./config.ts")),
  },
} satisfies DeliveryConfig;
