/// <reference lib="dom" />

import { Admin, Router } from "@cosmos/studio";
import { hydrateRoot } from "react-dom/client";
import { queries, services } from "./studio.ts";

const url = new URL(location.href);
const router = new Router(queries, services);
const result = await router.route(url);

hydrateRoot(
  globalThis.document,
  <Admin route={result} queries={queries} />,
);
