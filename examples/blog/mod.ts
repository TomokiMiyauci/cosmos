import { Delivery } from "@cosmos/delivery";
import { Asset } from "@cosmos/delivery/asset";
import { GraphqlProtocol, SchemaBuilder } from "@cosmos/protocol-graphql";
import { RelayPlugin } from "@cosmos/protocol-graphql/relay";
import { OpenCrud } from "@cosmos/protocol-graphql/opencrud";
import { NamerPlugin } from "@miyauci/graphql-transformer/namer";
import { ExecutableDirectivePlugin } from "@miyauci/graphql-transformer/executable-directive";
import { UppercaseDirective } from "@miyauci/graphql-directives";
import { NodePlugin } from "@cosmos/protocol-graphql/node";
import { createDatalayer } from "@cosmos/indexer";
import { DatabaseSync } from "node:sqlite";
import { Indexer } from "@cosmos/indexer";
import { SqliteStore } from "@cosmos/store-sqlite";
import { DirectiveLocation } from "graphql";
import config from "./cosmos/config.ts";

const db = new DatabaseSync(":memory:");
const store = new SqliteStore(db);
const indexer = new Indexer(
  config,
  new URL(import.meta.resolve("./cosmos/config.ts")),
);

const result = await indexer.index(store);

const datalayer = createDatalayer(store);

const delivery = new Delivery({
  protocol: new GraphqlProtocol(
    new SchemaBuilder({
      plugins: [
        new RelayPlugin(),
        new NodePlugin(),
        new OpenCrud(),
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
  manifest: result.manifest,
  datalayer,
  middleware: [new Asset()],
});

export default {
  fetch(req): Promise<Response> {
    return delivery.handle(req);
  },
} satisfies Deno.ServeDefaultExport;
