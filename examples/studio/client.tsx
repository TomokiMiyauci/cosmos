/// <reference lib="dom" />

import { Admin, en, I18n, Router } from "@cosmos/ui";
import { RestCmsService } from "@cosmos/ui/rest";
import { hydrateRoot } from "react-dom/client";
import { API_ENDPOINT } from "./constant.ts";

const url = new URL(location.href);
const service = new RestCmsService(new URL(API_ENDPOINT));
const router = new Router(service);
const i18n = new I18n(en);
const result = await router.route(url);

hydrateRoot(
  globalThis.document,
  <Admin
    route={result}
    service={service}
    translation={i18n}
  />,
);
