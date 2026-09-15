/// <reference lib="dom" />

import { Admin, Router } from "@cosmos/studio";
import { hydrateRoot } from "react-dom/client";
import { queries, services } from "./studio.ts";

const router = new Router(queries, services);
const url = new URL(location.href);
const result = await router.route(url);

const root = hydrateRoot(
  globalThis.document,
  <Admin route={result} />,
);

navigation.addEventListener("navigate", (e) => {
  if (!e.canIntercept || e.navigationType !== "push") return;
  const url = new URL(e.destination.url);

  e.intercept({
    handler: async () => {
      const result = await router.route(url);

      root.render(<Admin route={result} />);
    },
  });
});
