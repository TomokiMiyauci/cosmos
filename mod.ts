// import { Delivery } from "@cosmos/delivery";
import { Indexer } from "@cosmos/indexer";
import config from "./cosmos/config.ts";
import { MemoryStorage } from "@cosmos/storage-memory";

const indexer = new Indexer(config);
const st = new MemoryStorage();

const manifest = await indexer.index(st);

import { GraphQLDelivery } from "@cosmos/delivery-graphql";
import { RelayPlugin } from "@cosmos/delivery-graphql/relay";

const delivery = new GraphQLDelivery({
  plugins: [new RelayPlugin()],
});

export default {
  fetch: (req) =>
    delivery.handle(req, {
      manifest,
      fetcher: {
        fetch: (id) => {
          const u8 = st.read(new URL(id));
          const text = new TextDecoder().decode(u8);

          return JSON.parse(text);
        },
      },
    }),
} satisfies Deno.ServeDefaultExport;

// import { LifetimeCache } from "@cosmos/delivery/middleware";
// import { GraphqlProtocol } from "@cosmos/protocol/graphql";
// import { RelayQuery } from "@cosmos/protocol/graphql/plugin";

// const manifest = {};
// const fetcher = {};

// const protocol = new GraphqlProtocol({
//   plugins: [new RelayQuery()],
// });
// const delivrey = new Delivery({
//   protocol,
//   middleware: [new LifetimeCache()],
// });

// const builder = new HandlerBuilder(delivery);
// const handler = builder.build();

// handler(new Request());
