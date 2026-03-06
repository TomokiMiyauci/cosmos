import {
  type Config,
  type Definition,
  type Field,
  type Format,
  type Formatter,
  JSONFormatter,
  type Manifest,
  type Schema,
} from "@cosmos/core";
import { nodeTreeToOrigin, originToNodeTree, Visitor } from "./util.ts";
import { ReferenceTransfomer } from "./transformers/reference.ts";

export async function createIndex(
  config: Config,
): Promise<Manifest> {
  const contentsMap = new Map<string, unknown>();
  const promise = config.models.map(async (model) => {
    const contents = await config.source.fetch(model, { config });

    const schemas = model.fields.map(fieldToSchema);
    const formatter = resolveFormatter(model.format);

    const jsons = contents.map(({ content, id }) => {
      return {
        key: id,
        value: formatter.parse(content),
      };
    });

    const members = jsons.map(({ key }) => key);
    jsons.forEach(({ key, value }) => {
      contentsMap.set(key, value);
    });

    const definition = {
      name: model.name,
      schemas,
      members,
    } satisfies Definition;

    return definition;
  });

  const definitions = await Promise.all(promise);
  const entries = contentsMap.entries().map(([key, value]) => ({
    key,
    value,
  })).toArray();

  const nodeTrees = originToNodeTree({ definitions, entries });
  function resolveId(original: string): string {
    const id = config.source.resolve(original);

    if (contentsMap.has(id)) return id;

    throw new Error();
  }
  const visitor = new Visitor([
    new ReferenceTransfomer(resolveId),
  ]);
  const transformed = visitor.visit(nodeTrees);
  const finalEntries = nodeTreeToOrigin(transformed);

  return {
    version: "1",
    definitions,
    entries: finalEntries,
  };
}

function resolveFormatter(format: Format): Formatter {
  switch (format) {
    case "json":
      return new JSONFormatter();
  }
}

function fieldToSchema(field: Field): Schema {
  const { name, type, required = false, description = "" } = field;

  switch (type) {
    case "reference": {
      return {
        name,
        required,
        type,
        description,
        to: field.to,
      };
    }
  }

  return {
    name,
    required,
    type,
    description,
  };
}
