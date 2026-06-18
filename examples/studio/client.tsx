/// <reference lib="dom" />

import { Admin, Router } from "@cosmos/ui";
import { hydrateRoot } from "react-dom/client";
import { Service } from "@cosmos/service";
import { API_ENDPOINT } from "./constant.ts";

const url = new URL(location.href);
const router = new Router();
const result = router.route(url);

hydrateRoot(
  globalThis.document,
  <Admin
    route={result}
    service={new Service(new URL(API_ENDPOINT))}
  />,
);
