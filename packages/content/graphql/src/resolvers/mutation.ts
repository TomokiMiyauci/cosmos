import type {
  CreateEntryResult,
  MutationResolvers,
  UpdateEntryResult,
  Violation,
} from "~type";
import { fromNode } from "@cosmos/schema-node";
import type {
  UpsertCommandInput,
  Violation as ContentViolation,
} from "@cosmos/content";
import type { Context } from "./type.ts";

export default {
  createEntry: {
    async resolve(_, args, context): Promise<CreateEntryResult> {
      const model = args.input.model;
      const contents = fromNode(args.input.content);
      const [data, error] = await context.commands.entry.create.execute({
        model,
        contents,
      });

      if (error) {
        switch (error.type) {
          case "INVALID_CONTENT": {
            const violations = error.violations.map(toViolation);

            return {
              __typename: "ValidationError",
              violations,
            };
          }
        }
        // switch (error.type) {
        //   case "INVALID_MODEL": {}
        //   case "MODEL_NOT_FOUND": {}
        //   case "SCHEMA_NOT_FOUND": {}
        // }

        throw new Error();
      }

      return { id: data, __typename: "CreateEntrySuccess" };
    },
  },

  updateEntry: {
    async resolve(_, args, context): Promise<UpdateEntryResult> {
      const contents = fromNode(args.input.content);
      const input = {
        id: args.input.id,
        model: args.input.model,
        contents,
      } satisfies UpsertCommandInput;
      const [data, error] = await context.commands.entry.upsert.execute(input);

      if (error) {
        switch (error.type) {
          case "INVALID_CONTENT": {
            const violations = error.violations.map(toViolation);

            return {
              __typename: "ValidationError",
              violations,
            };
          }
        }

        throw new Error();
      }

      return { __typename: "UpdateEntrySuccess", id: data };
    },
  },

  deleteEntry: {
    async resolve(_, args, context): Promise<boolean> {
      const [__, error] = await context.commands.entry.delete.execute(args.id);

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
} satisfies MutationResolvers<Context>;

function toViolation(violation: ContentViolation): Violation {
  return {
    __typename: "Violation" as const,
    path: violation.path.map((value) => value.toString()),
    reason: violation.kind,
  };
}
