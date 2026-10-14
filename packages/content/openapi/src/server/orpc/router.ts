import { os } from "./contract.ts";
import {
  deleteEntry,
  getEntry,
  getSummaries,
  postEntry,
  putEntry,
} from "./handlers/entry.ts";
import { getModel, getModels } from "./handlers/model.ts";
import { getSchema, getSchemas } from "./handlers/schema.ts";

export const router = os.router({
  deleteEntry,
  getEntry,
  postEntry,
  getModel,
  getModels,
  getSchema,
  getSchemas,
  getSummaries,
  putEntry,
});
