import {
  type Collection,
  type Config,
  type Field,
  type FieldMeta,
  type Format,
  type Formatter,
  JSONFormatter,
  type Manifest,
} from "@cosmos/core";

export async function createIndex(
  config: Config,
): Promise<Manifest> {
  const promise = config.models.map(async (model) => {
    const contents = await config.source.fetch(model, { config });

    const meta = model.fields.map(fieldToMetaField);
    const formatter = resolveFormatter(model.format);

    const jsons = contents.map(({ content }) => formatter.parse(content));

    const collection = {
      name: model.name,
      typeName: model.name,
      meta,
      documents: jsons,
    } satisfies Collection;

    return collection;
  });

  const collections = await Promise.all(promise);

  return {
    version: "1",
    collections,
  };
}

function resolveFormatter(format: Format): Formatter {
  switch (format) {
    case "json":
      return new JSONFormatter();
  }
}

function fieldToMetaField(field: Field): FieldMeta {
  const { name, type, required = false, description = "" } = field;

  return {
    name,
    required,
    type,
    description,
  };
}
