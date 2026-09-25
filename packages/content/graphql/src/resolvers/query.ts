import type { QueryResolvers } from "~type";
import type { EntryView, ModelView, SchemaView } from "@cosmos/content";
import type { Context } from "./type.ts";

export default {
  entry: {
    async resolve(_, args, context): Promise<EntryView | null> {
      const entryView = await context.queries.entry.findById(args.id);

      return entryView;
    },
  },
  entries: {
    async resolve(_, args, context): Promise<EntryView[]> {
      const entreis = await context.queries.entry.findAll({
        model: args.model ?? undefined,
      });

      return entreis;
    },
  },
  models: {
    async resolve(_, __, context): Promise<ModelView[]> {
      const models = await context.queries.model.findAll();

      return models;
    },
  },
  model: {
    async resolve(_, args, context): Promise<ModelView | null> {
      const model = await context.queries.model.findById(args.id);

      return model;
    },
  },
  schemas: {
    resolve(_, __, context): Promise<SchemaView[]> {
      return context.queries.schema.findAll();
    },
  },
  schema: {
    resolve(_, args, context): Promise<SchemaView | null> {
      return context.queries.schema.findById(args.id);
    },
  },
} satisfies QueryResolvers<Context>;
