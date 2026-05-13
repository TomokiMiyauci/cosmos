import { createDelivery } from "@cosmos/delivery";
import config from "./cosmos/delivery.ts";

const handle = await createDelivery(config);

export default {
  fetch(req): Promise<Response> | Response {
    return handle(req);
  },
} satisfies Deno.ServeDefaultExport;
