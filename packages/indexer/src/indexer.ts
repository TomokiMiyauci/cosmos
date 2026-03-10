import {
  type Config,
  type Definition,
  type Field,
  type Manifest,
  mergeURLPatternInput,
  Parser,
  resolveFormatter,
  type Schema,
  type Storage,
} from "@cosmos/core";
import { Visitor } from "./util.ts";
import type { ContentSource } from "./type.ts";
import { ReferenceTransfomer } from "./transformers/reference.ts";

export class Indexer {
  constructor(public config: Config) {}

  async index(storage: Storage): Promise<Manifest> {
    const { model, locator, source, formatters } = this.config;
    const formatterMap = formatters.reduce((acc, { type, formatter }) => {
      return {
        ...acc,
        [type]: formatter,
      };
    }, {});
    const contensSource: ContentSource[] = [];
    const promise = model.models.map(async (def) => {
      const patternInit = mergeURLPatternInput(model.base, def.pattern);
      const pattern = new URLPattern(patternInit);
      const urls = await locator.locate(pattern);
      const contents = await Promise.all(urls.map(async (url) => {
        return {
          url,
          content: await source.read(url),
        };
      }));

      const schemas = def.fields.map(fieldToSchema);
      const formatter = resolveFormatter(def.format, formatterMap);
      const decoder = new TextDecoder();

      const jsons = contents.map(({ content, url }) => {
        const text = decoder.decode(content);

        return {
          key: url,
          value: formatter.parse(text, {
            config: this.config,
            options: def.format,
          }),
        };
      });

      const members = jsons.map(({ key }) => key.toString());
      jsons.forEach(({ key, value }) => {
        const parsed = new Parser().parse(value, def);

        contensSource.push({ source: key, content: parsed });
      });

      const definition = {
        name: def.name,
        schemas,
        members,
      } satisfies Definition;

      return definition;
    });

    const definitions = await Promise.all(promise);

    const visitor = new Visitor({
      config: this.config,
      transformers: [
        new ReferenceTransfomer(),
      ],
    });

    const result = visitor.visit(contensSource);

    for (const source of result) {
      const content = new Parser().stringify(source.content);
      const value = JSON.stringify(content);
      const encoded = new TextEncoder().encode(value);
      storage.write(source.source, encoded);
    }

    return {
      version: "1",
      definitions,
    };
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
