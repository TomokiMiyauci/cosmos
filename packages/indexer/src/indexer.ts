import {
  type Config,
  type Definition,
  type Field,
  type Format,
  type Formatter,
  JSONFormatter,
  type Manifest,
  type Schema,
  type Storage,
} from "@cosmos/core";
import { nodeTreeToOrigin, originToNodeTree, Visitor } from "./util.ts";
import { ReferenceTransfomer } from "./transformers/reference.ts";
import { join } from "@std/path";

export class Indexer {
  constructor(public config: Config) {}

  async index(storage: Storage): Promise<Manifest> {
    const { model, locator, source } = this.config;
    const contentsMap = new Map<string, unknown>();
    const promise = model.models.map(async (def) => {
      const patternInit = mergeURLPatternInput(model.pattern, def.pattern);
      const pattern = new URLPattern(patternInit);
      const urls = await locator.locate(pattern);
      const contents = await Promise.all(urls.map(async (url) => {
        return {
          url,
          content: await source.read(url),
        };
      }));

      const schemas = def.fields.map(fieldToSchema);
      const formatter = resolveFormatter(def.format);
      const decoder = new TextDecoder();

      const jsons = contents.map(({ content, url }) => {
        const text = decoder.decode(content);

        return {
          key: url,
          value: formatter.parse(text),
        };
      });

      const members = jsons.map(({ key }) => key.toString());
      jsons.forEach(({ key, value }) => {
        contentsMap.set(key.toString(), value);
      });

      const definition = {
        name: def.name,
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
    function resolveId(original: URLPatternInit): string {
      const init = mergeURLPatternInput(model.pattern, original);
      const pattern = new URLPattern(init);

      for (const url of contentsMap.keys()) {
        if (pattern.test(url)) return url;
      }

      throw new Error();
    }
    const visitor = new Visitor([
      new ReferenceTransfomer(resolveId),
    ]);
    const transformed = visitor.visit(nodeTrees);
    const finalEntries = nodeTreeToOrigin(transformed);

    finalEntries.forEach((entry) => {
      const url = new URL(entry.key);
      const value = JSON.stringify(entry.value);
      const encoded = new TextEncoder().encode(value);

      storage.write(url, encoded);
    });

    return {
      version: "1",
      definitions,
    };
  }
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

function mergeURLPatternInput(
  left: URLPatternInit,
  right: URLPatternInit,
): URLPatternInit {
  return {
    protocol: right.protocol ?? left.protocol,
    hash: right.hash ?? left.hash,
    hostname: right.hostname ?? left.hostname,
    password: right.password ?? left.password,
    port: right.port ?? left.port,
    baseURL: right.baseURL ?? left.baseURL,
    search: right.search ?? left.search,
    username: right.username ?? left.username,
    pathname: mergePathname(right.pathname, left.pathname),
  };
}

function mergePathname(
  left: string | undefined,
  right: string | undefined,
): string | undefined {
  if (typeof left === "undefined" && typeof right === "undefined") return;

  if (typeof left === "string" && typeof right === "string") {
    return join(right, left);
  }

  if (typeof left === "string") return left;

  return right;
}
