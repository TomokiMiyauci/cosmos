import type { EntryId } from "./id.ts";
import type { Entry } from "./model.ts";
import type { Option } from "@miyauci/util";
import type { Node } from "../../types/node.ts";

export interface EntryRepositry {
  save(entry: Entry, ctx: EntryContext): Promise<void>;

  findById(id: EntryId, ctx: EntryContext): Promise<Option<Entry>>;

  delete(id: EntryId): Promise<void>;
}

export interface EntryContext {
  converter: Conterter;
}

export interface Conterter {
  toBlob(node: Node): Blob;
  fromBlog(blog: Blob): Node;
}
