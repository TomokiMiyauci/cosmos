import type {
  // Identifier,
  MutationResolvers,
  Resolvers,
} from "./generated/resolver_type.ts";
import type { Usecases } from "@cosmos/content";

const Mutation = {
  // createEntry: {
  //   async resolve(_, args, context): Promise<Identifier> {
  //     const model = args.model;
  //     const contents = toContents(args.content);

  //     const [data, error] = await context.entry.create.execute({
  //       model,
  //       contents,
  //     });

  //     if (error) {
  //       switch (error.type) {
  //         case "INVALID_CONTENT": {}
  //         case "INVALID_MODEL": {}
  //         case "MODEL_NOT_FOUND": {}
  //         case "SCHEMA_NOT_FOUND": {}
  //       }
  //     }

  //     return { id: data };
  //   },
  // },

  deleteEntry: {
    async resolve(_, args, context): Promise<boolean> {
      const [__, error] = await context.entry.delete.execute(args.id);

      if (error) {
        switch (error.type) {
          case "INVALID_ID": {
            return false;
          }
        }
      }

      return true;
    },
  },
} satisfies MutationResolvers<Usecases>;

export const resolvers = {
  Mutation,
} satisfies Resolvers<Usecases>;
