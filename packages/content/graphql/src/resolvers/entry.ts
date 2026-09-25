import type { EntryResolvers } from "../generated/resolver_type.ts";
import type { ModelView } from "@cosmos/content";
import { type Node, toNode } from "@cosmos/schema-node";
import type { Context } from "./type.ts";

export default {
  createdAt: {
    resolve(view): Date {
      return new Date(view.createdAt.epochMilliseconds);
    },
  },
  updatedAt: {
    resolve(view): Date {
      return new Date(view.updatedAt.epochMilliseconds);
    },
  },
  model: {
    async resolve(view, _, context): Promise<ModelView> {
      const model = await context.queries.model.findById(view.modelId);

      if (!model) throw new Error();

      return model;
    },
  },
  content: {
    resolve(view): Node {
      const node = toNode(view.content);

      return node;
    },
  },
} satisfies EntryResolvers<Context>;
