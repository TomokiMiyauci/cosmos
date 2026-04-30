import { Delivery } from "@cosmos/delivery";
import { Asset } from "@cosmos/delivery/asset";
import { GraphqlProtocol, SchemaBuilder } from "@cosmos/protocol-graphql";
import { RelayPlugin } from "@cosmos/protocol-graphql/relay";
import { OpenCrud } from "@cosmos/protocol-graphql/opencrud";
import { NamerPlugin } from "@miyauci/graphql-transformer/namer";
import { ExecutableDirectivePlugin } from "@miyauci/graphql-transformer/executable-directive";
import { UppercaseDirective } from "@miyauci/graphql-directives";
import { SchemaTransformer } from "@miyauci/graphql-transformer";
import { NodePlugin } from "@cosmos/protocol-graphql/node";
import { createDatalayer } from "@cosmos/indexer";
import { DatabaseSync } from "node:sqlite";
import { Indexer } from "@cosmos/indexer";
import { SqliteStore } from "@cosmos/store-sqlite";
import { assertValidSchema, DirectiveLocation } from "graphql";
import config from "./cosmos/config.ts";

const db = new DatabaseSync(":memory:");
const store = new SqliteStore(db);
const indexer = new Indexer(config);

const result = await indexer.index(store);

const datalayer = createDatalayer(store);
const builder = new SchemaBuilder({
  plugins: [
    new RelayPlugin(),
    new NodePlugin(),
    new OpenCrud(),
  ],
});
const schema = builder.build({
  manifest: result.manifest,
  datalayer,
});

const transformer = new SchemaTransformer({
  plugins: [
    new NamerPlugin(),
    new ExecutableDirectivePlugin({
      directives: [
        new UppercaseDirective([DirectiveLocation.FIELD]),
      ],
    }),
  ],
});
const finalSchema = transformer.transform(schema);

assertValidSchema(finalSchema);

const delivery = new Delivery({
  protocol: new GraphqlProtocol(finalSchema),
  manifest: result.manifest,
  datalayer,
  middleware: [new Asset()],
});

export default {
  fetch(req): Promise<Response> {
    return delivery.handle(req);
  },
} satisfies Deno.ServeDefaultExport;
